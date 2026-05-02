package com.caglar.notification.dto.request;

public record OrderConfirmedRequestDto(
        Long orderId,
        String customerEmail,
        String customerName,
        Double totalAmount,
        String currency
) {}
