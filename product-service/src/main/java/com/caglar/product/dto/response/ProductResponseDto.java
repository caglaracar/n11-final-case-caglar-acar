package com.caglar.product.dto.response;

import lombok.Builder;

import java.time.Instant;
import java.util.List;

@Builder
public record ProductResponseDto(
        String id,
        String name,
        String description,
        Double price,
        Double originalPrice,
        String currency,
        String categoryId,
        String subcategory,
        String brand,
        Integer stock,
        String imageUrl,
        List<String> images,
        String badge,
        List<String> features,
        Long sellerAuthId,
        Long viewCount,
        Long searchCount,
        Instant flashDealEndsAt,
        Instant priceDropAt,
        Instant createdAt,
        Instant updatedAt
) {}
