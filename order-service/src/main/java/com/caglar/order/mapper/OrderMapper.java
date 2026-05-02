package com.caglar.order.mapper;

import com.caglar.order.dto.response.OrderItemResponseDto;
import com.caglar.order.dto.response.OrderResponseDto;
import com.caglar.order.entity.Order;
import com.caglar.order.entity.OrderItem;

public final class OrderMapper {

    private OrderMapper() {}

    public static OrderResponseDto toResponse(Order order) {
        return new OrderResponseDto(
                order.getId(),
                order.getAuthId(),
                order.getCustomerEmail(),
                order.getCustomerName(),
                order.getTotalAmount(),
                order.getCurrency(),
                order.getStatus(),
                order.getShippingAddress(),
                order.getShippingCity(),
                order.getItems().stream().map(OrderMapper::toItem).toList(),
                order.getCreatedAt(),
                order.getUpdatedAt()
        );
    }

    public static OrderItemResponseDto toItem(OrderItem item) {
        return new OrderItemResponseDto(
                item.getProductId(),
                item.getProductName(),
                item.getCategory(),
                item.getUnitPrice(),
                item.getQuantity()
        );
    }
}
