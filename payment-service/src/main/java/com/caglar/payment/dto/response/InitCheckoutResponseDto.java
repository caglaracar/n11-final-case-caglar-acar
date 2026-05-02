package com.caglar.payment.dto.response;

public record InitCheckoutResponseDto(
        Long paymentId,
        Long orderId,
        String paymentPageUrl,
        String token
) {}
