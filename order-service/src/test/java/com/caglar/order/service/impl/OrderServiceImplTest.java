package com.caglar.order.service.impl;

import com.caglar.common.dto.BaseResponse;
import com.caglar.common.event.OrderPlacedEvent;
import com.caglar.common.exception.BusinessException;
import com.caglar.order.client.BasketClient;
import com.caglar.order.client.NotificationClient;
import com.caglar.order.client.PaymentClient;
import com.caglar.order.client.ProductStockClient;
import com.caglar.order.client.UserClient;
import com.caglar.order.client.dto.AddressDto;
import com.caglar.order.client.dto.BasketDto;
import com.caglar.order.client.dto.InitCheckoutResponse;
import com.caglar.order.client.dto.UserProfileDto;
import com.caglar.order.dto.request.CheckoutRequestDto;
import com.caglar.order.dto.response.CheckoutResponseDto;
import com.caglar.order.dto.response.OrderResponseDto;
import com.caglar.order.entity.Order;
import com.caglar.order.enums.OrderStatus;
import com.caglar.order.helper.OrderEventPublisher;
import com.caglar.order.repository.OrderRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;
import static org.mockito.BDDMockito.willThrow;

@ExtendWith(MockitoExtension.class)
class OrderServiceImplTest {

    @Mock OrderRepository orderRepository;
    @Mock BasketClient basketClient;
    @Mock UserClient userClient;
    @Mock ProductStockClient stockClient;
    @Mock PaymentClient paymentClient;
    @Mock OrderEventPublisher eventPublisher;
    @Mock NotificationClient notificationClient;

    @InjectMocks OrderServiceImpl service;

    private static final Long AUTH_ID = 1L;

    // ─── Checkout ────────────────────────────────────────────────

    @Test
    void checkout_createsOrderAndReturnsPaymentPageUrl() {
        given(basketClient.getMyBasket()).willReturn(BaseResponse.success(
                basket(List.of(new BasketDto.Item("p1", "Laptop", 1, 999.0)), 999.0)));
        given(userClient.me()).willReturn(BaseResponse.success(profile("user@mail.com")));
        given(userClient.myAddresses()).willReturn(BaseResponse.success(List.of(address("addr-1"))));
        given(orderRepository.save(any())).willReturn(buildOrder(10L, AUTH_ID, OrderStatus.PENDING, 999.0));
        given(paymentClient.initiate(any())).willReturn(BaseResponse.success(
                new InitCheckoutResponse(1L, 10L, "https://pay.iyzico.com/page", "tok123")));

        CheckoutResponseDto result = service.checkout(AUTH_ID, new CheckoutRequestDto("addr-1", "127.0.0.1"));

        assertThat(result.orderId()).isEqualTo(10L);
        assertThat(result.paymentPageUrl()).isEqualTo("https://pay.iyzico.com/page");
        assertThat(result.paymentToken()).isEqualTo("tok123");
    }

    @Test
    void checkout_throwsException_whenBasketIsEmpty() {
        given(basketClient.getMyBasket()).willReturn(BaseResponse.success(
                basket(List.of(), 0.0)));

        assertThatThrownBy(() -> service.checkout(AUTH_ID, new CheckoutRequestDto("addr-1", "127.0.0.1")))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("boş");
    }

    @Test
    void checkout_throwsException_whenTotalExceedsHundredThousand() {
        // 100.000 TRY ve üzeri sipariş kabul edilmemelidir
        given(basketClient.getMyBasket()).willReturn(BaseResponse.success(
                basket(List.of(new BasketDto.Item("p1", "Araba", 1, 99_999.99)), 99_999.99)));

        assertThatThrownBy(() -> service.checkout(AUTH_ID, new CheckoutRequestDto("addr-1", "127.0.0.1")))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("100.000");
    }

    @Test
    void checkout_throwsException_whenDeliveryAddressNotInUserAddresses() {
        given(basketClient.getMyBasket()).willReturn(BaseResponse.success(
                basket(List.of(new BasketDto.Item("p1", "Laptop", 1, 100.0)), 100.0)));
        given(userClient.me()).willReturn(BaseResponse.success(profile("user@mail.com")));
        given(userClient.myAddresses()).willReturn(BaseResponse.success(
                List.of(address("different-addr"))));

        assertThatThrownBy(() -> service.checkout(AUTH_ID, new CheckoutRequestDto("addr-1", "127.0.0.1")))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void checkout_rollsBackOrderAndReleasesStock_whenPaymentInitFails() {
        given(basketClient.getMyBasket()).willReturn(BaseResponse.success(
                basket(List.of(new BasketDto.Item("p1", "Laptop", 1, 100.0)), 100.0)));
        given(userClient.me()).willReturn(BaseResponse.success(profile("user@mail.com")));
        given(userClient.myAddresses()).willReturn(BaseResponse.success(List.of(address("addr-1"))));
        given(orderRepository.save(any())).willReturn(buildOrder(10L, AUTH_ID, OrderStatus.PENDING, 100.0));
        willThrow(new RuntimeException("Stok rezerve edilemedi")).given(stockClient).reserve(any());

        assertThatThrownBy(() -> service.checkout(AUTH_ID, new CheckoutRequestDto("addr-1", "127.0.0.1")))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Stok");
    }

    // ─── Sipariş sorgulama ───────────────────────────────────────

    @Test
    void getById_returnsOrderDto_whenBelongsToUser() {
        Order order = buildOrder(5L, AUTH_ID, OrderStatus.PAID, 200.0);
        given(orderRepository.findById(5L)).willReturn(Optional.of(order));

        OrderResponseDto result = service.getById(AUTH_ID, 5L);

        assertThat(result.id()).isEqualTo(5L);
        assertThat(result.status()).isEqualTo(OrderStatus.PAID);
        assertThat(result.totalAmount()).isEqualTo(200.0);
    }

    @Test
    void getById_throwsException_whenOrderBelongsToDifferentUser() {
        Order order = buildOrder(5L, 99L, OrderStatus.PAID, 200.0);
        given(orderRepository.findById(5L)).willReturn(Optional.of(order));

        assertThatThrownBy(() -> service.getById(AUTH_ID, 5L))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void getMyOrders_returnsOrdersSortedDescendingByDefault() {
        given(orderRepository.findByAuthIdOrderByIdDesc(AUTH_ID)).willReturn(List.of(
                buildOrder(3L, AUTH_ID, OrderStatus.PAID, 300.0),
                buildOrder(1L, AUTH_ID, OrderStatus.CANCELLED, 100.0)
        ));

        List<OrderResponseDto> result = service.getMyOrders(AUTH_ID);

        assertThat(result).hasSize(2);
        assertThat(result.get(0).id()).isEqualTo(3L); // en yeni önce
    }

    // ─── İptal ───────────────────────────────────────────────────

    @Test
    void cancel_setsCancelledAndReleasesReservedStock() {
        Order order = buildOrder(5L, AUTH_ID, OrderStatus.PENDING, 100.0);
        given(orderRepository.findById(5L)).willReturn(Optional.of(order));
        given(orderRepository.save(any())).willReturn(order);

        OrderResponseDto result = service.cancel(AUTH_ID, 5L);

        assertThat(result.status()).isEqualTo(OrderStatus.CANCELLED);
        then(stockClient).should().release(any());
    }

    @Test
    void cancel_throwsException_whenOrderAlreadyCancelled() {
        Order order = buildOrder(5L, AUTH_ID, OrderStatus.CANCELLED, 100.0);
        given(orderRepository.findById(5L)).willReturn(Optional.of(order));

        assertThatThrownBy(() -> service.cancel(AUTH_ID, 5L))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void cancel_throwsException_whenOrderAlreadyPaid() {
        Order order = buildOrder(5L, AUTH_ID, OrderStatus.PAID, 100.0);
        given(orderRepository.findById(5L)).willReturn(Optional.of(order));

        assertThatThrownBy(() -> service.cancel(AUTH_ID, 5L))
                .isInstanceOf(BusinessException.class);
    }

    // ─── Ödeme sonuçları ─────────────────────────────────────────

    @Test
    void onPaymentCompleted_marksOrderAsPaid_andClearsBasketAndNotifies() {
        Order order = buildOrder(5L, AUTH_ID, OrderStatus.PENDING, 100.0);
        order.setCustomerEmail("user@mail.com");
        given(orderRepository.findById(5L)).willReturn(Optional.of(order));
        given(orderRepository.save(any())).willReturn(order);

        service.onPaymentCompleted(5L);

        assertThat(order.getStatus()).isEqualTo(OrderStatus.PAID);
        then(basketClient).should().clear(AUTH_ID);                                  // sepet temizlenmeli
        then(eventPublisher).should().publishOrderPlaced(any(OrderPlacedEvent.class)); // Kafka event
        then(notificationClient).should().sendOrderConfirmed(any());                  // direkt bildirim
    }

    @Test
    void onPaymentCompleted_isIdempotent_whenOrderAlreadyPaid() {
        Order order = buildOrder(5L, AUTH_ID, OrderStatus.PAID, 100.0);
        given(orderRepository.findById(5L)).willReturn(Optional.of(order));

        service.onPaymentCompleted(5L); // ikinci kez tetiklense de bir şey yapmamalı

        then(basketClient).shouldHaveNoInteractions();
        then(eventPublisher).shouldHaveNoInteractions();
    }

    @Test
    void onPaymentFailed_marksOrderAsFailedAndReleasesStock() {
        Order order = buildOrder(5L, AUTH_ID, OrderStatus.PENDING, 100.0);
        given(orderRepository.findById(5L)).willReturn(Optional.of(order));
        given(orderRepository.save(any())).willReturn(order);

        service.onPaymentFailed(5L, "Kart limiti yetersiz");

        assertThat(order.getStatus()).isEqualTo(OrderStatus.FAILED);
        then(stockClient).should().release(any());
    }

    // ─── Admin ───────────────────────────────────────────────────

    @Test
    void adminGetOrders_returnsPagedResults_withoutFilter() {
        given(orderRepository.findAllByOrderByIdDesc(any(Pageable.class)))
                .willReturn(new PageImpl<>(List.of(buildOrder(1L, AUTH_ID, OrderStatus.PAID, 100.0))));

        Page<OrderResponseDto> result = service.adminGetOrders(0, 20, null);

        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent().get(0).status()).isEqualTo(OrderStatus.PAID);
    }

    @Test
    void adminGetOrders_filtersResultsByStatus() {
        given(orderRepository.findAllByStatusOrderByIdDesc(any(OrderStatus.class), any(Pageable.class)))
                .willReturn(new PageImpl<>(List.of(buildOrder(1L, AUTH_ID, OrderStatus.PENDING, 100.0))));

        Page<OrderResponseDto> result = service.adminGetOrders(0, 20, OrderStatus.PENDING);

        assertThat(result.getContent()).allMatch(o -> o.status() == OrderStatus.PENDING);
    }

    @Test
    void adminUpdateStatus_transitionsOrderToNewStatus() {
        Order order = buildOrder(5L, AUTH_ID, OrderStatus.PAID, 100.0);
        given(orderRepository.findById(5L)).willReturn(Optional.of(order));
        given(orderRepository.save(any())).willReturn(order);

        OrderResponseDto result = service.adminUpdateStatus(5L, OrderStatus.SHIPPED);

        assertThat(result.status()).isEqualTo(OrderStatus.SHIPPED);
        then(orderRepository).should().save(order);
    }

    // ─── Helpers ─────────────────────────────────────────────────

    private Order buildOrder(Long id, Long authId, OrderStatus status, double total) {
        Order order = Order.builder()
                .authId(authId)
                .totalAmount(total)
                .currency("TRY")
                .status(status)
                .shippingAddress("Test Cad. No:1")
                .shippingCity("İstanbul")
                .build();
        order.setId(id);
        return order;
    }

    private BasketDto basket(List<BasketDto.Item> items, double total) {
        return new BasketDto(AUTH_ID, items, total);
    }

    private UserProfileDto profile(String email) {
        return new UserProfileDto("uid-1", AUTH_ID, "caglar", "Çağlar", "Acar",
                email, "+905551112233", null, "USER");
    }

    private AddressDto address(String id) {
        return new AddressDto(id, "Ev", "Çağlar Acar", "+905551112233",
                "Atatürk Cad. No:1", null, "İstanbul", "Kadıköy", "34700", "Türkiye", true);
    }
}
