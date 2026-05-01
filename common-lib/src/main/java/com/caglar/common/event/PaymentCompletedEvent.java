package com.caglar.common.event;

public record PaymentCompletedEvent(
        Long orderId,
        Long authId,
        Long paymentId,
        Double amount,
        String currency,
        String providerRef,
        Long completedAt
) {}
