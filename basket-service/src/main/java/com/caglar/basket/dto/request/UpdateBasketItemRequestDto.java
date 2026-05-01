package com.caglar.basket.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

@Builder
public record UpdateBasketItemRequestDto(
        @NotBlank String productId,
        @NotNull @Min(0) Integer quantity
) {}
