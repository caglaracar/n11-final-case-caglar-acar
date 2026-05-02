package com.caglar.order.dto.response;

import com.caglar.order.enums.OrderStatus;

import java.util.List;

public record OrderResponseDto(
        Long id,
        Long authId,
        String customerEmail,
        String customerName,
        Double totalAmount,
        String currency,
        OrderStatus status,
        String shippingAddress,
        String shippingCity,
        List<OrderItemResponseDto> items,
        Long createdAt,
        Long updatedAt
) {}
