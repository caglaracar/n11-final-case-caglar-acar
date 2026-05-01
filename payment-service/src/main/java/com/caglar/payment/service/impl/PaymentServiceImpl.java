package com.caglar.payment.service.impl;

import com.caglar.common.event.OrderCreatedEvent;
import com.caglar.common.exception.BusinessException;
import com.caglar.common.exception.ErrorType;
import com.caglar.payment.config.PaymentProperties;
import com.caglar.payment.dto.request.CheckoutRequestDto;
import com.caglar.payment.dto.response.PaymentResponseDto;
import com.caglar.payment.entity.Payment;
import com.caglar.payment.enums.PaymentStatus;
import com.caglar.payment.helper.PaymentEventPublisher;
import com.caglar.payment.mapper.PaymentMapper;
import com.caglar.payment.provider.PaymentProvider;
import com.caglar.payment.repository.PaymentRepository;
import com.caglar.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final PaymentProvider paymentProvider;
    private final PaymentBootstrapService paymentBootstrapService;
    private final PaymentEventPublisher paymentEventPublisher;
    private final PaymentProperties paymentProperties;

    @Override
    @Transactional
    public Payment processOrder(OrderCreatedEvent ev) {
        var existing = paymentRepository.findByOrderId(ev.orderId());
        if (existing.isPresent()) {
            log.info("Idempotent — payment record already exists for orderId={}", ev.orderId());
            return existing.get();
        }

        Payment payment = paymentRepository.save(PaymentMapper.fromOrderEvent(ev));

        if (paymentProperties.isIyzico()) {
            log.info("İyzico mode: PENDING payment created for orderId={}, waiting for frontend checkout", ev.orderId());
            return payment;
        }
        var result = paymentProvider.charge(ev.orderId(), ev.totalAmount(), ev.currency(), null);
        return finalizeAndPublish(payment, result);
    }

    @Override
    @Transactional
    public PaymentResponseDto checkout(Long authId, CheckoutRequestDto dto) {
        Payment payment = ensurePending(authId, dto.orderId());

        if (payment.getStatus() == PaymentStatus.SUCCESS) {
            log.info("Idempotent checkout — already successful orderId={}", dto.orderId());
            return PaymentMapper.toResponse(payment);
        }
        if (payment.getStatus() == PaymentStatus.FAILED) {
            throw new BusinessException(ErrorType.INVALID_ARGUMENT,
                    "Bu sipariş daha önce başarısız ödeme aldı. Lütfen yeni sipariş oluşturun.");
        }

        PaymentProvider.CardInfo card = new PaymentProvider.CardInfo(
                dto.holderName(), dto.cardNumber(),
                dto.expireMonth(), dto.expireYear(), dto.cvc());

        var result = paymentProvider.charge(payment.getOrderId(), payment.getAmount(), payment.getCurrency(), card);
        finalizeAndPublish(payment, result);
        return PaymentMapper.toResponse(payment);
    }

    /**
     * PENDING kaydı varsa döner; yoksa REQUIRES_NEW transaction'da oluşturur.
     * Yarış durumunda 1 kez retry yapar.
     */
    private Payment ensurePending(Long authId, Long orderId) {
        var existing = paymentRepository.findByOrderId(orderId);
        if (existing.isPresent()) {
            return existing.get();
        }
        try {
            return paymentBootstrapService.ensurePending(authId, orderId);
        } catch (DataIntegrityViolationException race) {
            log.info("ensurePending — concurrent create detected, retrying lookup orderId={}", orderId);
            return paymentRepository.findByOrderId(orderId)
                    .orElseThrow(() -> new BusinessException(ErrorType.NOT_FOUND,
                            "Ödeme kaydı oluşturulamadı."));
        }
    }

    /** Provider sonucuna göre status'u günceller, kaydı saklar ve event yayınlar. */
    private Payment finalizeAndPublish(Payment payment, PaymentProvider.PaymentResult result) {
        if (result.success()) {
            payment.setStatus(PaymentStatus.SUCCESS);
            payment.setProviderRef(result.providerRef());
            paymentRepository.save(payment);
            paymentEventPublisher.publishCompleted(payment);
        } else {
            payment.setStatus(PaymentStatus.FAILED);
            payment.setFailReason(result.failReason());
            paymentRepository.save(payment);
            paymentEventPublisher.publishFailed(payment);
        }
        return payment;
    }
}
