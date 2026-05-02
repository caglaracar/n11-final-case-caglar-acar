package com.caglar.order.dto.response;

public record CheckoutResponseDto(
        Long orderId,
        String paymentPageUrl,
        String paymentToken
) {}
