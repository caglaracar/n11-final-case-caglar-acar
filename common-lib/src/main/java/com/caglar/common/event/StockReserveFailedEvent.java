package com.caglar.common.event;

public record StockReserveFailedEvent(
        Long orderId,
        String reason
) {}
