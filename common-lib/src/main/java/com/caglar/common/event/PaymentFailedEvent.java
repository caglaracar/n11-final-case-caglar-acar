package com.caglar.common.event;

/**
 * payment-service → order-service
 * Iyzico callback başarısız olduğunda yayınlanır.
 */
public record PaymentFailedEvent(
        Long orderId,
        Long paymentId,
        String reason
) {}
