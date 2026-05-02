package com.caglar.order.client.dto;

import java.util.List;

public record BasketDto(
        Long authId,
        List<Item> items,
        Double total
) {
    public record Item(
            String productId,
            String productName,
            Integer quantity,
            Double unitPrice
    ) {}
}
