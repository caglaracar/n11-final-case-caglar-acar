package com.caglar.order.client.dto;

public record OrderConfirmedNotificationRequest(
        Long orderId,
        String customerEmail,
        String customerName,
        Double totalAmount,
        String currency
) {}
