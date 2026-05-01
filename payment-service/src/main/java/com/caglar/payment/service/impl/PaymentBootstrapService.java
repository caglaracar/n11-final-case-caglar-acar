package com.caglar.payment.service.impl;

import com.caglar.common.exception.BusinessException;
import com.caglar.common.exception.ErrorType;
import com.caglar.payment.entity.Payment;
import com.caglar.payment.client.OrderServiceClient;
import com.caglar.payment.mapper.PaymentMapper;
import com.caglar.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/**
 * Self-heal akışı için ayrı bean. checkout()'un dış transaction'ından bağımsız
 * (REQUIRES_NEW) çalışmalı; aksi halde duplicate-insert sırasında oluşan
 * unique-violation outer Session'ı rollback-only yapar ve sonraki sorgu
 * "null id" assertion ile çöker.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentBootstrapService {

    private final PaymentRepository paymentRepository;
    private final OrderServiceClient orderServiceClient;

    /**
     * Eksik PENDING kaydını yeni bir transaction'da oluşturur. Eşzamanlı
     * çağrı zaten oluşturmuşsa duplicate exception yakalanır ve mevcut kayıt
     * geri okunur.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public Payment ensurePending(Long authId, Long orderId) {
        return paymentRepository.findByOrderId(orderId).orElseGet(() -> createFromOrder(authId, orderId));
    }

    private Payment createFromOrder(Long authId, Long orderId) {
        OrderServiceClient.OrderSummary order = lookupOrder(orderId);
        guardOwnership(authId, order);
        log.warn("ensurePending — creating PENDING payment from order lookup orderId={}", orderId);
        try {
            return paymentRepository.saveAndFlush(PaymentMapper.fromOrderSummary(order));
        } catch (DataIntegrityViolationException dup) {
            log.info("ensurePending — duplicate detected, reusing concurrent record orderId={}", orderId);
            throw dup; // outer @Transactional(REQUIRES_NEW) rollback olur, çağıran retry yapar.
        }
    }

    private OrderServiceClient.OrderSummary lookupOrder(Long orderId) {
        OrderServiceClient.OrderSummary order;
        try {
            var resp = orderServiceClient.getById(orderId);
            order = resp != null && resp.getBody() != null ? resp.getBody().data() : null;
        } catch (Exception e) {
            log.error("ensurePending — order lookup failed orderId={}", orderId, e);
            throw new BusinessException(ErrorType.NOT_FOUND,
                    "Sipariş için ödeme kaydı bulunamadı ve sipariş doğrulanamadı.");
        }
        if (order == null) {
            throw new BusinessException(ErrorType.NOT_FOUND, "Sipariş bulunamadı.");
        }
        return order;
    }

    private void guardOwnership(Long authId, OrderServiceClient.OrderSummary order) {
        if (authId != null && order.authId() != null && !authId.equals(order.authId())) {
            throw new BusinessException(ErrorType.ACCESS_DENIED, "Bu sipariş size ait değil.");
        }
    }
}
