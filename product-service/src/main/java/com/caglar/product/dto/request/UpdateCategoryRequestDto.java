package com.caglar.product.dto.request;

import lombok.Builder;

@Builder
public record UpdateCategoryRequestDto(
        String name,
        String description,
        String slug,
        String iconClass,
        String highlightLabel,
        Boolean visibleInNav,
        Integer sortOrder
) {}
