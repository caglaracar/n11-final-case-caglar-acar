package com.caglar.order.service.impl;

import com.caglar.common.event.OrderPlacedEvent;
import com.caglar.common.exception.BusinessException;
import com.caglar.common.exception.ErrorType;
import com.caglar.order.client.BasketClient;
import com.caglar.order.client.PaymentClient;
import com.caglar.order.client.ProductStockClient;
import com.caglar.order.client.UserClient;
import com.caglar.order.client.dto.AddressDto;
import com.caglar.order.client.dto.BasketDto;
import com.caglar.order.client.dto.InitCheckoutRequest;
import com.caglar.order.client.dto.InitCheckoutResponse;
import com.caglar.order.client.dto.UserProfileDto;
import com.caglar.order.dto.request.CheckoutRequestDto;
import com.caglar.order.dto.response.CheckoutResponseDto;
import com.caglar.order.dto.response.OrderResponseDto;
import com.caglar.order.entity.Order;
import com.caglar.order.enums.OrderStatus;
import com.caglar.order.helper.OrderEventPublisher;
import com.caglar.order.mapper.CheckoutMapper;
import com.caglar.order.mapper.OrderMapper;
import com.caglar.order.repository.OrderRepository;
import com.caglar.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Sipariş yaşam döngüsünü yönetir:
 *  1. {@link #checkout} — sepet + profil + adres alır, PENDING order yaratır,
 *     stok rezerve eder, payment-service'i tetikler.
 *  2. {@link #onPaymentCompleted} / {@link #onPaymentFailed} — Kafka saga callback'leri.
 *  3. {@link #cancel} — yalnızca PENDING order için stok release + status güncelleme.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private static final String CURRENCY = "TRY";
    /** iyzico tek seferde 100.000 TRY ve üzeri tutarı kabul etmiyor. */
    private static final double MAX_CHECKOUT_AMOUNT = 99_999.99;

    private final OrderRepository orderRepository;
    private final BasketClient basketClient;
    private final UserClient userClient;
    private final ProductStockClient stockClient;
    private final PaymentClient paymentClient;
    private final OrderEventPublisher eventPublisher;

    @Override
    @Transactional
    public CheckoutResponseDto checkout(Long authId, CheckoutRequestDto request) {
        BasketDto basket = fetchBasket();
        UserProfileDto profile = fetchProfile();
        AddressDto shippingAddress = fetchAddress(request.addressId());

        Order order = createPendingOrder(authId, basket, profile, shippingAddress);
        reserveStockOrFail(order);
        InitCheckoutResponse paymentInit = initiatePaymentOrRollback(order, profile, shippingAddress, request.clientIp());

        return new CheckoutResponseDto(order.getId(), paymentInit.paymentPageUrl(), paymentInit.token());
    }

    @Override
    public OrderResponseDto getById(Long authId, Long orderId) {
        return OrderMapper.toResponse(findOwnedOrder(authId, orderId));
    }

    @Override
    public List<OrderResponseDto> getMyOrders(Long authId) {
        return orderRepository.findByAuthIdOrderByIdDesc(authId).stream()
                .map(OrderMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public OrderResponseDto cancel(Long authId, Long orderId) {
        Order order = findOwnedOrder(authId, orderId);
        ensureCancellable(order);

        stockClient.release(CheckoutMapper.toStockOpRequest(order));
        order.setStatus(OrderStatus.CANCELLED);
        return OrderMapper.toResponse(orderRepository.save(order));
    }

    @Override
    @Transactional
    public void onPaymentCompleted(Long orderId) {
        Order order = findOrderOrThrow(orderId);
        if (order.getStatus() != OrderStatus.PENDING) {
            log.info("payment.completed ignored orderId={} status={}", orderId, order.getStatus());
            return;
        }
        order.setStatus(OrderStatus.PAID);
        orderRepository.save(order);
        publishPaidEvents(order);
    }

    @Override
    @Transactional
    public void onPaymentFailed(Long orderId, String reason) {
        Order order = findOrderOrThrow(orderId);
        if (order.getStatus() != OrderStatus.PENDING) {
            log.info("payment.failed ignored orderId={} status={}", orderId, order.getStatus());
            return;
        }
        order.setStatus(OrderStatus.FAILED);
        orderRepository.save(order);
        safeReleaseStock(order);
        log.info("Order FAILED orderId={} reason={}", orderId, reason);
    }

    // -------------------------------------------------------------------------
    // checkout pipeline
    // -------------------------------------------------------------------------

    private BasketDto fetchBasket() {
        BasketDto basket = unwrap(basketClient.getMyBasket().data(), "Sepet alınamadı");
        if (basket.items() == null || basket.items().isEmpty()) {
            throw new BusinessException(ErrorType.BASKET_NOT_FOUND, "Sepet boş");
        }
        Double total = basket.total();
        if (total != null && total >= MAX_CHECKOUT_AMOUNT) {
            throw new BusinessException(
                    ErrorType.PAYMENT_FAILED,
                    "Tek bir siparişte ödeme tutarı 100.000 TRY ve üzerinde olamaz. Lütfen sepetini bölerek tekrar dene.");
        }
        return basket;
    }

    private UserProfileDto fetchProfile() {
        return unwrap(userClient.me().data(), "Kullanıcı bulunamadı");
    }

    private AddressDto fetchAddress(String addressId) {
        List<AddressDto> addresses = unwrap(userClient.myAddresses().data(), "Adresler alınamadı");
        return addresses.stream()
                .filter(address -> addressId.equals(address.id()))
                .findFirst()
                .orElseThrow(() -> new BusinessException(ErrorType.ADDRESS_NOT_FOUND));
    }

    private Order createPendingOrder(Long authId, BasketDto basket, UserProfileDto profile, AddressDto address) {
        Order order = CheckoutMapper.toPendingOrder(authId, basket, profile, address, CURRENCY);
        return orderRepository.save(order);
    }

    private void reserveStockOrFail(Order order) {
        try {
            stockClient.reserve(CheckoutMapper.toStockOpRequest(order));
        } catch (RuntimeException ex) {
            markFailed(order);
            log.warn("Stock reserve failed orderId={}: {}", order.getId(), ex.getMessage());
            throw new BusinessException(ErrorType.PRODUCT_OUT_OF_STOCK,
                    "Stok rezervasyonu başarısız: " + ex.getMessage());
        }
    }

    private InitCheckoutResponse initiatePaymentOrRollback(Order order,
                                                           UserProfileDto profile,
                                                           AddressDto address,
                                                           String clientIp) {
        InitCheckoutRequest paymentRequest = CheckoutMapper.toInitCheckoutRequest(order, profile, address, clientIp);
        try {
            return unwrap(paymentClient.initiate(paymentRequest).data(), "Ödeme başlatılamadı");
        } catch (RuntimeException ex) {
            safeReleaseStock(order);
            markFailed(order);
            throw new BusinessException(ErrorType.PAYMENT_FAILED,
                    "Ödeme başlatılamadı: " + ex.getMessage());
        }
    }

    // -------------------------------------------------------------------------
    // saga callbacks
    // -------------------------------------------------------------------------

    private void publishPaidEvents(Order order) {
        eventPublisher.publishOrderPlaced(new OrderPlacedEvent(
                order.getId(), order.getAuthId(), order.getCustomerEmail(),
                order.getCustomerName(), order.getTotalAmount(), order.getCurrency()));
        eventPublisher.publishConfirmationEmail(order.getCustomerEmail(),
                order.getId(), order.getTotalAmount(), order.getCurrency());
    }

    private void safeReleaseStock(Order order) {
        try {
            stockClient.release(CheckoutMapper.toStockOpRequest(order));
        } catch (RuntimeException ex) {
            log.error("Stock release failed orderId={}: {}", order.getId(), ex.getMessage());
        }
    }

    // -------------------------------------------------------------------------
    // common helpers
    // -------------------------------------------------------------------------

    private Order findOrderOrThrow(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException(ErrorType.ORDER_NOT_FOUND));
    }

    private Order findOwnedOrder(Long authId, Long orderId) {
        Order order = findOrderOrThrow(orderId);
        if (!order.getAuthId().equals(authId)) {
            throw new BusinessException(ErrorType.ACCESS_DENIED);
        }
        return order;
    }

    private void markFailed(Order order) {
        order.setStatus(OrderStatus.FAILED);
        orderRepository.save(order);
    }

    private static void ensureCancellable(Order order) {
        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new BusinessException(ErrorType.ORDER_ALREADY_CANCELLED);
        }
        if (order.getStatus() != OrderStatus.PENDING) {
            throw new BusinessException(ErrorType.ORDER_CANNOT_BE_CANCELLED);
        }
    }

    private static <T> T unwrap(T data, String fallback) {
        if (data == null) {
            throw new BusinessException(ErrorType.INTERNAL_ERROR, fallback);
        }
        return data;
    }
}
