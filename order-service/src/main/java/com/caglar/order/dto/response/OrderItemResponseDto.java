package com.caglar.order.dto.response;

public record OrderItemResponseDto(
        String productId,
        String productName,
        String category,
        Double unitPrice,
        Integer quantity
) {}
