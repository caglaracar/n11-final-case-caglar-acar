package com.caglar.common.event;

import java.util.List;

public record OrderCreatedEvent(
        Long orderId,
        Long authId,
        List<OrderItem> items,
        Double totalAmount,
        String currency,
        Long createdAt
) {
    public record OrderItem(String productId, String productName, Integer quantity, Double unitPrice) {}
}
