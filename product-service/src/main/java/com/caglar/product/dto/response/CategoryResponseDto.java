package com.caglar.product.dto.response;

import lombok.Builder;

@Builder
public record CategoryResponseDto(
        String id,
        String name,
        String description,
        String slug,
        String iconClass,
        String highlightLabel,
        boolean visibleInNav,
        int sortOrder
) {}
