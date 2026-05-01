package com.caglar.order.mapper;

import com.caglar.order.dto.request.CreateOrderRequestDto;
import com.caglar.order.dto.response.OrderResponseDto;
import com.caglar.order.entity.Order;
import com.caglar.order.entity.OrderItem;
import com.caglar.order.enums.OrderStatus;

import java.util.ArrayList;

public final class OrderMapper {

    private OrderMapper() {}

    /** Yeni Order'ı PAYMENT_PENDING durumunda + items ve totalAmount doldurulmuş şekilde üretir. */
    public static Order fromCreateRequest(Long authId, CreateOrderRequestDto dto) {
        Order order = Order.builder()
                .authId(authId)
                .status(OrderStatus.CREATED)
                .currency(dto.currency())
                .userEmail(dto.userEmail())
                .items(new ArrayList<>())
                .totalAmount(0d)
                .build();
        dto.items().forEach(i -> order.addItem(OrderItem.builder()
                .productId(i.productId())
                .productName(i.productName())
                .quantity(i.quantity())
                .unitPrice(i.unitPrice())
                .build()));
        order.setStatus(OrderStatus.PAYMENT_PENDING);
        return order;
    }

    public static OrderResponseDto toResponse(Order o) {
        return OrderResponseDto.builder()
                .id(o.getId())
                .authId(o.getAuthId())
                .status(o.getStatus().name())
                .totalAmount(o.getTotalAmount())
                .currency(o.getCurrency())
                .items(o.getItems().stream()
                        .map(i -> OrderResponseDto.Item.builder()
                                .productId(i.getProductId())
                                .productName(i.getProductName())
                                .quantity(i.getQuantity())
                                .unitPrice(i.getUnitPrice())
                                .build())
                        .toList())
                .createdAt(o.getCreatedAtUtc())
                .updatedAt(o.getUpdatedAtUtc())
                .build();
    }
}
