package com.caglar.common.event;

public record PaymentFailedEvent(
        Long orderId,
        Long paymentId,
        String reason
) {}
