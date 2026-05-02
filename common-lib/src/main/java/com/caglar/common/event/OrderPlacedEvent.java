package com.caglar.common.event;

/**
 * order-service → notification-service (audit/log)
 * Sipariş PAID statüsüne geçtiğinde yayınlanır.
 */
public record OrderPlacedEvent(
        Long orderId,
        Long authId,
        String email,
        String customerName,
        Double total,
        String currency
) {}
