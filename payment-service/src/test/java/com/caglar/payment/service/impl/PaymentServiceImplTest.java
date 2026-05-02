package com.caglar.payment.service.impl;

import com.caglar.common.exception.BusinessException;
import com.caglar.payment.config.IyzicoProperties;
import com.caglar.payment.dto.request.InitCheckoutRequestDto;
import com.caglar.payment.dto.response.InitCheckoutResponseDto;
import com.caglar.payment.dto.response.PaymentResponseDto;
import com.caglar.payment.entity.Payment;
import com.caglar.payment.enums.PaymentStatus;
import com.caglar.payment.helper.PaymentEventPublisher;
import com.caglar.payment.repository.PaymentRepository;
import com.caglar.payment.service.IyzicoService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;

@ExtendWith(MockitoExtension.class)
class PaymentServiceImplTest {

    @Mock PaymentRepository paymentRepository;
    @Mock IyzicoService iyzicoService;
    @Mock PaymentEventPublisher eventPublisher;
    @Mock IyzicoProperties iyzicoProperties;

    @InjectMocks PaymentServiceImpl service;

    @Test
    void initiate_savesPaymentAndReturnsPageUrl() {
        given(iyzicoProperties.callbackUrl()).willReturn("https://callback.url");
        given(iyzicoService.initialize(any(), anyString()))
                .willReturn(new IyzicoService.Result(true, "https://pay.iyzico.com/page", "token123", null, null));

        Payment saved = buildPayment(1L, 10L, PaymentStatus.INITIATED, "token123");
        given(paymentRepository.save(any())).willReturn(saved);

        InitCheckoutRequestDto req = buildCheckoutRequest(10L, 1L, 299.99);
        InitCheckoutResponseDto result = service.initiate(req);

        assertThat(result.paymentPageUrl()).isEqualTo("https://pay.iyzico.com/page");
        assertThat(result.token()).isEqualTo("token123");
        then(paymentRepository).should().save(any());
    }

    @Test
    void initiate_throwsBusinessException_whenIyzicoFails() {
        given(iyzicoProperties.callbackUrl()).willReturn("https://callback.url");
        given(iyzicoService.initialize(any(), anyString()))
                .willReturn(new IyzicoService.Result(false, null, null, null, "api bilgileri bulunamadı"));

        assertThatThrownBy(() -> service.initiate(buildCheckoutRequest(10L, 1L, 100.0)))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("api bilgileri bulunamadı");
    }

    @Test
    void handleCallback_marksSuccess_andPublishesEvent() {
        Payment payment = buildPayment(1L, 10L, PaymentStatus.INITIATED, "tok-success");
        given(paymentRepository.findByIyzicoToken("tok-success")).willReturn(Optional.of(payment));
        given(iyzicoService.retrieve("tok-success", 10L))
                .willReturn(new IyzicoService.Result(true, null, "tok-success", "iyzico-pay-id", null));
        given(paymentRepository.save(any())).willReturn(payment);
        given(iyzicoProperties.successRedirect()).willReturn("https://shop.com/orders/{orderId}/result");

        service.handleCallback("tok-success");

        assertThat(payment.getStatus()).isEqualTo(PaymentStatus.SUCCESS);
        then(eventPublisher).should().publishCompleted(any());
    }

    @Test
    void handleCallback_marksFailed_andPublishesFailedEvent() {
        Payment payment = buildPayment(1L, 10L, PaymentStatus.INITIATED, "tok-fail");
        given(paymentRepository.findByIyzicoToken("tok-fail")).willReturn(Optional.of(payment));
        given(iyzicoService.retrieve("tok-fail", 10L))
                .willReturn(new IyzicoService.Result(false, null, "tok-fail", null, "Kart reddedildi"));
        given(paymentRepository.save(any())).willReturn(payment);
        given(iyzicoProperties.failureRedirect()).willReturn("https://shop.com/orders/{orderId}/result");

        service.handleCallback("tok-fail");

        assertThat(payment.getStatus()).isEqualTo(PaymentStatus.FAILED);
        assertThat(payment.getFailReason()).contains("Kart reddedildi");
        then(eventPublisher).should().publishFailed(any());
    }

    @Test
    void handleCallback_ignoresDuplicateCallback_whenAlreadyProcessed() {
        Payment payment = buildPayment(1L, 10L, PaymentStatus.SUCCESS, "tok-dup");
        given(paymentRepository.findByIyzicoToken("tok-dup")).willReturn(Optional.of(payment));
        given(iyzicoProperties.successRedirect()).willReturn("https://shop.com/orders/{orderId}/result");

        service.handleCallback("tok-dup");

        then(iyzicoService).shouldHaveNoInteractions();
        then(eventPublisher).shouldHaveNoInteractions();
    }

    @Test
    void handleCallback_throwsException_whenTokenNotFound() {
        given(paymentRepository.findByIyzicoToken("unknown")).willReturn(Optional.empty());

        assertThatThrownBy(() -> service.handleCallback("unknown"))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void getByOrderId_returnsPaymentDto() {
        Payment payment = buildPayment(5L, 10L, PaymentStatus.SUCCESS, "tok");
        payment.setAmount(500.0);
        payment.setCurrency("TRY");
        given(paymentRepository.findFirstByOrderIdOrderByIdDesc(10L)).willReturn(Optional.of(payment));

        PaymentResponseDto result = service.getByOrderId(10L);

        assertThat(result.id()).isEqualTo(5L);
        assertThat(result.status()).isEqualTo(PaymentStatus.SUCCESS);
        assertThat(result.amount()).isEqualTo(500.0);
    }

    @Test
    void getByOrderId_throwsException_whenNotFound() {
        given(paymentRepository.findFirstByOrderIdOrderByIdDesc(99L)).willReturn(Optional.empty());

        assertThatThrownBy(() -> service.getByOrderId(99L))
                .isInstanceOf(BusinessException.class);
    }

    // helpers
    private Payment buildPayment(Long id, Long orderId, PaymentStatus status, String token) {
        Payment p = Payment.builder()
                .orderId(orderId)
                .authId(1L)
                .iyzicoToken(token)
                .status(status)
                .build();
        p.setId(id);
        return p;
    }

    private InitCheckoutRequestDto buildCheckoutRequest(Long orderId, Long authId, double amount) {
        return new InitCheckoutRequestDto(
                orderId, authId, amount, "TRY",
                new InitCheckoutRequestDto.Buyer("Ad", "Soyad", "test@mail.com", "+905551112233", "11111111111", "Adres", "İstanbul", "Turkey", "127.0.0.1"),
                new InitCheckoutRequestDto.Address("Ad Soyad", "İstanbul", "Turkey", "Adres", "34000"),
                new InitCheckoutRequestDto.Address("Ad Soyad", "İstanbul", "Turkey", "Adres", "34000"),
                List.of(new InitCheckoutRequestDto.Item("p1", "Ürün", "Genel", amount, 1))
        );
    }
}
