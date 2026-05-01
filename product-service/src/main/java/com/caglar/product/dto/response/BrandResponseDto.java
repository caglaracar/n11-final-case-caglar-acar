package com.caglar.product.dto.response;

import lombok.Builder;

@Builder
public record BrandResponseDto(
        String id,
        String name,
        String description,
        String slug,
        String logoUrl,
        boolean active,
        int sortOrder
) {}
