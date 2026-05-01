package com.caglar.common.event;

import java.util.List;

public record StockReserveRequestedEvent(
        Long orderId,
        List<Item> items
) {
    public record Item(String productId, Integer quantity) {}
}
