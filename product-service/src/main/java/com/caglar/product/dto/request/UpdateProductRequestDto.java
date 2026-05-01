package com.caglar.product.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Positive;
import lombok.Builder;

import java.time.Instant;
import java.util.List;

@Builder
public record UpdateProductRequestDto(
        String name,
        String description,
        @Positive Double price,
        Double originalPrice,
        String categoryId,
        String subcategory,
        String brand,
        @Min(0) Integer stock,
        String imageUrl,
        List<String> images,
        String badge,
        List<String> features,
        Instant flashDealEndsAt
) {}
