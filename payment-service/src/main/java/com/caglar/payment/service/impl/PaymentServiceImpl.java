package com.caglar.payment.service.impl;

import com.caglar.common.event.PaymentCompletedEvent;
import com.caglar.common.event.PaymentFailedEvent;
import com.caglar.common.exception.BusinessException;
import com.caglar.common.exception.ErrorType;
import com.caglar.payment.config.IyzicoProperties;
import com.caglar.payment.dto.request.InitCheckoutRequestDto;
import com.caglar.payment.dto.response.InitCheckoutResponseDto;
import com.caglar.payment.dto.response.PaymentResponseDto;
import com.caglar.payment.entity.Payment;
import com.caglar.payment.enums.PaymentStatus;
import com.caglar.payment.helper.PaymentEventPublisher;
import com.caglar.payment.repository.PaymentRepository;
import com.caglar.payment.service.IyzicoService;
import com.caglar.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;

/**
 * Payment yaşam döngüsü:
 *  1. {@link #initiate} — iyzico checkout form başlatır, INITIATED Payment yaratır.
 *  2. {@link #handleCallback} — iyzico callback'inde retrieve eder, SUCCESS/FAILED işler ve
 *     ilgili Kafka event'ini yayınlar; tarayıcıyı frontend redirect URL'ine yönlendirir.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private static final int MAX_FAIL_REASON_LENGTH = 500;
    private static final String ORDER_ID_PLACEHOLDER = "{orderId}";

    private final PaymentRepository paymentRepository;
    private final IyzicoService iyzicoService;
    private final PaymentEventPublisher eventPublisher;
    private final IyzicoProperties iyzicoProperties;

    @Override
    @Transactional
    public InitCheckoutResponseDto initiate(InitCheckoutRequestDto request) {
        IyzicoService.Result result = iyzicoService.initialize(request, iyzicoProperties.callbackUrl());
        if (!result.success()) {
            throw new BusinessException(ErrorType.PAYMENT_FAILED,
                    "İyzico checkout başlatılamadı: " + result.errorMessage());
        }
        Payment payment = paymentRepository.save(buildInitiated(request, result.token()));
        log.info("Payment initiated paymentId={} orderId={} token={}",
                payment.getId(), payment.getOrderId(), result.token());
        return new InitCheckoutResponseDto(payment.getId(), payment.getOrderId(),
                result.paymentPageUrl(), result.token());
    }

    @Override
    @Transactional
    public ResponseEntity<Void> handleCallback(String token) {
        Payment payment = paymentRepository.findByIyzicoToken(token)
                .orElseThrow(() -> new BusinessException(ErrorType.PAYMENT_NOT_FOUND));

        if (payment.getStatus() != PaymentStatus.INITIATED) {
            log.warn("Callback ignored: paymentId={} alreadyStatus={}", payment.getId(), payment.getStatus());
            return redirectToFrontend(payment);
        }

        IyzicoService.Result result = iyzicoService.retrieve(token, payment.getOrderId());
        if (result.success()) {
            markSuccess(payment, result);
        } else {
            markFailed(payment, result);
        }
        return redirectToFrontend(payment);
    }

    @Override
    public PaymentResponseDto getByOrderId(Long orderId) {
        Payment payment = paymentRepository.findFirstByOrderIdOrderByIdDesc(orderId)
                .orElseThrow(() -> new BusinessException(ErrorType.PAYMENT_NOT_FOUND));
        return new PaymentResponseDto(
                payment.getId(),
                payment.getOrderId(),
                payment.getAmount(),
                payment.getCurrency(),
                payment.getStatus(),
                payment.getIyzicoPaymentId(),
                payment.getFailReason(),
                payment.getCreatedAt()
        );
    }

    // -------------------------------------------------------------------------
    // helpers
    // -------------------------------------------------------------------------

    private static Payment buildInitiated(InitCheckoutRequestDto request, String token) {
        return Payment.builder()
                .orderId(request.orderId())
                .authId(request.authId())
                .amount(request.totalAmount())
                .currency(request.currency())
                .iyzicoToken(token)
                .status(PaymentStatus.INITIATED)
                .build();
    }

    private void markSuccess(Payment payment, IyzicoService.Result result) {
        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setIyzicoPaymentId(result.iyzicoPaymentId());
        paymentRepository.save(payment);
        eventPublisher.publishCompleted(new PaymentCompletedEvent(
                payment.getOrderId(),
                payment.getId(),
                payment.getIyzicoPaymentId(),
                payment.getAmount(),
                payment.getCurrency()
        ));
    }

    private void markFailed(Payment payment, IyzicoService.Result result) {
        payment.setStatus(PaymentStatus.FAILED);
        payment.setIyzicoPaymentId(result.iyzicoPaymentId());
        payment.setFailReason(truncateForStorage(result.errorMessage()));
        paymentRepository.save(payment);
        eventPublisher.publishFailed(new PaymentFailedEvent(
                payment.getOrderId(),
                payment.getId(),
                payment.getFailReason()
        ));
    }

    private ResponseEntity<Void> redirectToFrontend(Payment payment) {
        String template = payment.getStatus() == PaymentStatus.SUCCESS
                ? iyzicoProperties.successRedirect()
                : iyzicoProperties.failureRedirect();
        String location = template.replace(ORDER_ID_PLACEHOLDER, String.valueOf(payment.getOrderId()));
        HttpHeaders headers = new HttpHeaders();
        headers.setLocation(URI.create(location));
        return new ResponseEntity<>(headers, HttpStatus.FOUND);
    }

    private static String truncateForStorage(String value) {
        if (value == null) {
            return null;
        }
        return value.length() > MAX_FAIL_REASON_LENGTH
                ? value.substring(0, MAX_FAIL_REASON_LENGTH)
                : value;
    }
}
