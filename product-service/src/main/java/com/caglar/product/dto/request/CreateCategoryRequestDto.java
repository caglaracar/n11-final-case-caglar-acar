package com.caglar.product.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

@Builder
public record CreateCategoryRequestDto(
        @NotBlank String name,
        String description,
        String slug,
        String iconClass,
        String highlightLabel,
        Boolean visibleInNav,
        Integer sortOrder
) {}
