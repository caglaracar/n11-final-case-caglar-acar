package com.caglar.product.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Builder;

import java.util.List;

@Builder
public record CreateProductRequestDto(
        @NotBlank String name,
        String description,
        @NotNull @Positive Double price,
        Double originalPrice,
        @NotBlank String currency,
        @NotBlank String categoryId,
        String subcategory,
        String brand,
        @NotNull @Min(0) Integer stock,
        String imageUrl,
        List<String> images,
        String badge,
        List<String> features
) {}
