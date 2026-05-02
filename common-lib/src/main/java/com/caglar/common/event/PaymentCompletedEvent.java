package com.caglar.common.event;

public record PaymentCompletedEvent(
        Long orderId,
        Long paymentId,
        String iyzicoPaymentId,
        Double amount,
        String currency
) {}
