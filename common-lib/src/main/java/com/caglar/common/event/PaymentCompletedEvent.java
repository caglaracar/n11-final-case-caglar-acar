package com.caglar.common.event;

/**
 * payment-service → order-service
 * Iyzico callback başarıyla doğrulandığında yayınlanır.
 */
public record PaymentCompletedEvent(
        Long orderId,
        Long paymentId,
        String iyzicoPaymentId,
        Double amount,
        String currency
) {}
