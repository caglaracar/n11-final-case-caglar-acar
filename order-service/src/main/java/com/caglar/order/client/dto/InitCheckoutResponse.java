package com.caglar.order.client.dto;

public record InitCheckoutResponse(
        Long paymentId,
        Long orderId,
        String paymentPageUrl,
        String token
) {}
