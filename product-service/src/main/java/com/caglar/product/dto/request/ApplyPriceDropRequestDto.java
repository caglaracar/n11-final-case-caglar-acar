package com.caglar.product.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Builder;

@Builder
public record ApplyPriceDropRequestDto(
        @NotNull @Positive Double price,
        @Positive Double originalPrice
) {}
