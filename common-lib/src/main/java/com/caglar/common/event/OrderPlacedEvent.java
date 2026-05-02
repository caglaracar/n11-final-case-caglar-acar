package com.caglar.common.event;

public record OrderPlacedEvent(
        Long orderId,
        Long authId,
        String email,
        String customerName,
        Double total,
        String currency
) {}
