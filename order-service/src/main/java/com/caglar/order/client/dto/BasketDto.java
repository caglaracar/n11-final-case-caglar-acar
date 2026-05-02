package com.caglar.order.client.dto;

import java.util.List;

/** basket-service GET /dev/v1/basket. */
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
