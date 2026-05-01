package com.caglar.order.dto.response;

import lombok.Builder;

import java.time.Instant;
import java.util.List;

@Builder
public record OrderResponseDto(
        Long id,
        Long authId,
        String status,
        Double totalAmount,
        String currency,
        List<Item> items,
        Instant createdAt,
        Instant updatedAt
) {
    @Builder
    public record Item(String productId, String productName, Integer quantity, Double unitPrice) {}
}
