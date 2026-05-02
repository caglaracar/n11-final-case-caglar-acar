package com.caglar.order.client.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record StockOpRequest(
        @NotNull Long orderId,
        @NotEmpty List<Item> items
) {
    public record Item(
            @NotBlank String productId,
            int quantity
    ) {}
}
