package com.caglar.payment.dto.response;

import lombok.Builder;

@Builder
public record PaymentResponseDto(
        Long orderId,
        Long paymentId,
        boolean success,
        String providerRef,
        String failReason,
        String status
) {}
