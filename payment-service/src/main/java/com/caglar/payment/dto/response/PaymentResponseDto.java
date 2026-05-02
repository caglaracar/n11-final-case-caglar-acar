package com.caglar.payment.dto.response;

import com.caglar.payment.enums.PaymentStatus;

public record PaymentResponseDto(
        Long id,
        Long orderId,
        Double amount,
        String currency,
        PaymentStatus status,
        String iyzicoPaymentId,
        String failReason,
        Long createdAt
) {}
