package com.caglar.product.dto.request;

import lombok.Builder;

@Builder
public record UpdateBrandRequestDto(
        String name,
        String description,
        String slug,
        String logoUrl,
        Boolean active,
        Integer sortOrder
) {}
