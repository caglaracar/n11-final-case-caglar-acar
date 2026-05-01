package com.caglar.common.event;

public record PaymentFailedEvent(
        Long orderId,
        Long authId,
        Long paymentId,
        String reason,
        Long failedAt
) {}
