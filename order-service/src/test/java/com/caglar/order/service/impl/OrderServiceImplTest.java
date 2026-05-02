package com.caglar.order.service.impl;

import com.caglar.common.dto.BaseResponse;
import com.caglar.common.event.OrderPlacedEvent;
import com.caglar.common.exception.BusinessException;
import com.caglar.order.client.BasketClient;
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

    @InjectMocks OrderServiceImpl service;

    private static final Long AUTH_ID = 1L;

    @Test
    void checkout_createsOrderAndReturnsPaymentUrl() {
        BasketDto basket = new BasketDto(AUTH_ID, List.of(new BasketDto.Item("p1", "Laptop", 1, 999.0)), 999.0);
        UserProfileDto profile = profile(AUTH_ID, "user@mail.com");
        AddressDto address = address("addr-1", "İstanbul");

        given(basketClient.getMyBasket()).willReturn(BaseResponse.success(basket));
        given(userClient.me()).willReturn(BaseResponse.success(profile));
        given(userClient.myAddresses()).willReturn(BaseResponse.success(List.of(address)));

        Order savedOrder = buildOrder(10L, AUTH_ID, OrderStatus.PENDING, 999.0);
        given(orderRepository.save(any())).willReturn(savedOrder);

        InitCheckoutResponse paymentResp = new InitCheckoutResponse(1L, 10L, "https://pay.iyzico.com", "tok123");
        given(paymentClient.initiate(any())).willReturn(BaseResponse.success(paymentResp));

        CheckoutResponseDto result = service.checkout(AUTH_ID, new CheckoutRequestDto("addr-1", "127.0.0.1"));

        assertThat(result.orderId()).isEqualTo(10L);
        assertThat(result.paymentPageUrl()).isEqualTo("https://pay.iyzico.com");
        assertThat(result.paymentToken()).isEqualTo("tok123");
    }

    @Test
    void checkout_throwsException_whenBasketIsEmpty() {
        BasketDto emptyBasket = new BasketDto(AUTH_ID, List.of(), 0.0);
        given(basketClient.getMyBasket()).willReturn(BaseResponse.success(emptyBasket));

        assertThatThrownBy(() -> service.checkout(AUTH_ID, new CheckoutRequestDto("addr-1", "127.0.0.1")))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("boş");
    }

    @Test
    void checkout_throwsException_whenAddressNotFound() {
        BasketDto basket = new BasketDto(AUTH_ID, List.of(new BasketDto.Item("p1", "Laptop", 1, 100.0)), 100.0);
        UserProfileDto profile = profile(AUTH_ID, "user@mail.com");
        AddressDto otherAddress = address("other-addr", "Ankara");

        given(basketClient.getMyBasket()).willReturn(BaseResponse.success(basket));
        given(userClient.me()).willReturn(BaseResponse.success(profile));
        given(userClient.myAddresses()).willReturn(BaseResponse.success(List.of(otherAddress)));

        assertThatThrownBy(() -> service.checkout(AUTH_ID, new CheckoutRequestDto("addr-1", "127.0.0.1")))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void checkout_rollsBackAndThrows_whenStockReserveFails() {
        BasketDto basket = new BasketDto(AUTH_ID, List.of(new BasketDto.Item("p1", "Laptop", 1, 100.0)), 100.0);
        UserProfileDto profile = profile(AUTH_ID, "user@mail.com");
        AddressDto address = address("addr-1", "İstanbul");

        given(basketClient.getMyBasket()).willReturn(BaseResponse.success(basket));
        given(userClient.me()).willReturn(BaseResponse.success(profile));
        given(userClient.myAddresses()).willReturn(BaseResponse.success(List.of(address)));

        Order savedOrder = buildOrder(10L, AUTH_ID, OrderStatus.PENDING, 100.0);
        given(orderRepository.save(any())).willReturn(savedOrder);
        willThrow(new RuntimeException("Stok yok")).given(stockClient).reserve(any());

        assertThatThrownBy(() -> service.checkout(AUTH_ID, new CheckoutRequestDto("addr-1", "127.0.0.1")))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Stok");
    }

    @Test
    void getById_returnsOrder_whenOwnedByUser() {
        Order order = buildOrder(5L, AUTH_ID, OrderStatus.PAID, 200.0);
        given(orderRepository.findById(5L)).willReturn(Optional.of(order));

        OrderResponseDto result = service.getById(AUTH_ID, 5L);

        assertThat(result.id()).isEqualTo(5L);
        assertThat(result.status()).isEqualTo(OrderStatus.PAID);
    }

    @Test
    void getById_throwsException_whenOrderBelongsToOtherUser() {
        Order order = buildOrder(5L, 99L, OrderStatus.PAID, 200.0);
        given(orderRepository.findById(5L)).willReturn(Optional.of(order));

        assertThatThrownBy(() -> service.getById(AUTH_ID, 5L))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void getMyOrders_returnsAllOrdersForUser() {
        List<Order> orders = List.of(
                buildOrder(1L, AUTH_ID, OrderStatus.PAID, 100.0),
                buildOrder(2L, AUTH_ID, OrderStatus.PENDING, 200.0)
        );
        given(orderRepository.findByAuthIdOrderByIdDesc(AUTH_ID)).willReturn(orders);

        List<OrderResponseDto> result = service.getMyOrders(AUTH_ID);

        assertThat(result).hasSize(2);
    }

    @Test
    void cancel_setsCancelledStatus_andReleasesStock() {
        Order order = buildOrder(5L, AUTH_ID, OrderStatus.PENDING, 100.0);
        given(orderRepository.findById(5L)).willReturn(Optional.of(order));
        given(orderRepository.save(any())).willReturn(order);

        OrderResponseDto result = service.cancel(AUTH_ID, 5L);

        assertThat(result.status()).isEqualTo(OrderStatus.CANCELLED);
        then(stockClient).should().release(any());
    }

    @Test
    void cancel_throwsException_whenAlreadyCancelled() {
        Order order = buildOrder(5L, AUTH_ID, OrderStatus.CANCELLED, 100.0);
        given(orderRepository.findById(5L)).willReturn(Optional.of(order));

        assertThatThrownBy(() -> service.cancel(AUTH_ID, 5L))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void cancel_throwsException_whenOrderIsPaid() {
        Order order = buildOrder(5L, AUTH_ID, OrderStatus.PAID, 100.0);
        given(orderRepository.findById(5L)).willReturn(Optional.of(order));

        assertThatThrownBy(() -> service.cancel(AUTH_ID, 5L))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void onPaymentCompleted_setsStatusPaidAndPublishesEvents() {
        Order order = buildOrder(5L, AUTH_ID, OrderStatus.PENDING, 100.0);
        order.setCustomerEmail("user@mail.com");
        given(orderRepository.findById(5L)).willReturn(Optional.of(order));
        given(orderRepository.save(any())).willReturn(order);

        service.onPaymentCompleted(5L);

        assertThat(order.getStatus()).isEqualTo(OrderStatus.PAID);
        then(eventPublisher).should().publishOrderPlaced(any(OrderPlacedEvent.class));
        then(eventPublisher).should().publishConfirmationEmail(any(), any(), any(), any());
    }

    @Test
    void onPaymentCompleted_ignoresEvent_whenNotPending() {
        Order order = buildOrder(5L, AUTH_ID, OrderStatus.PAID, 100.0);
        given(orderRepository.findById(5L)).willReturn(Optional.of(order));

        service.onPaymentCompleted(5L);

        then(eventPublisher).shouldHaveNoInteractions();
    }

    @Test
    void onPaymentFailed_setsStatusFailedAndReleasesStock() {
        Order order = buildOrder(5L, AUTH_ID, OrderStatus.PENDING, 100.0);
        given(orderRepository.findById(5L)).willReturn(Optional.of(order));
        given(orderRepository.save(any())).willReturn(order);

        service.onPaymentFailed(5L, "Kart reddedildi");

        assertThat(order.getStatus()).isEqualTo(OrderStatus.FAILED);
        then(stockClient).should().release(any());
    }

    @Test
    void adminGetOrders_returnsPagedOrders_withoutStatusFilter() {
        List<Order> orders = List.of(buildOrder(1L, AUTH_ID, OrderStatus.PAID, 100.0));
        given(orderRepository.findAllByOrderByIdDesc(any(Pageable.class)))
                .willReturn(new PageImpl<>(orders));

        Page<OrderResponseDto> result = service.adminGetOrders(0, 20, null);

        assertThat(result.getContent()).hasSize(1);
    }

    @Test
    void adminGetOrders_returnsPagedOrders_withStatusFilter() {
        List<Order> orders = List.of(buildOrder(1L, AUTH_ID, OrderStatus.PENDING, 100.0));
        given(orderRepository.findAllByStatusOrderByIdDesc(any(OrderStatus.class), any(Pageable.class)))
                .willReturn(new PageImpl<>(orders));

        Page<OrderResponseDto> result = service.adminGetOrders(0, 20, OrderStatus.PENDING);

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).status()).isEqualTo(OrderStatus.PENDING);
    }

    @Test
    void adminUpdateStatus_updatesAndReturnsOrder() {
        Order order = buildOrder(5L, AUTH_ID, OrderStatus.PAID, 100.0);
        given(orderRepository.findById(5L)).willReturn(Optional.of(order));
        given(orderRepository.save(any())).willReturn(order);

        OrderResponseDto result = service.adminUpdateStatus(5L, OrderStatus.SHIPPED);

        assertThat(result.status()).isEqualTo(OrderStatus.SHIPPED);
    }

    // helpers
    private Order buildOrder(Long id, Long authId, OrderStatus status, double total) {
        Order order = Order.builder()
                .authId(authId)
                .totalAmount(total)
                .currency("TRY")
                .status(status)
                .shippingAddress("Test Adres")
                .shippingCity("İstanbul")
                .build();
        order.setId(id);
        return order;
    }

    private UserProfileDto profile(Long authId, String email) {
        return new UserProfileDto("uid-1", authId, "testuser", "Ad", "Soyad", email, "+905551112233", null, "USER");
    }

    private AddressDto address(String id, String city) {
        return new AddressDto(id, "Ev", "Ad Soyad", "+905551112233", "Cadde No:1", null, city, "İstanbul", "34000", "Türkiye", true);
    }
}
