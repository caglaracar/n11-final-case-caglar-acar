package com.caglar.product.stock;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

/**
 * order-service → product-service:
 * Sipariş oluşturulurken / iptal edilirken stoktan düşme/iade için.
 */
public record StockOpRequestDto(
        @NotNull Long orderId,
        @NotEmpty @Valid List<Item> items
) {
    public record Item(
            @NotBlank String productId,
            @Min(1) int quantity
    ) {}
}
