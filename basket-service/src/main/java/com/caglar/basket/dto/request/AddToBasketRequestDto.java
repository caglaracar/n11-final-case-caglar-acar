package com.caglar.basket.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

@Builder
public record AddToBasketRequestDto(
        @NotBlank String productId,
        @NotBlank String productName,
        @NotNull @Min(1) Integer quantity,
        @NotNull Double unitPrice
) {}
