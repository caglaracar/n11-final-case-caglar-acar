package com.caglar.product.dto.request;

import lombok.Builder;

/** Tüm alanlar opsiyonel — sadece gönderilenler güncellenir (PATCH semantiği). */
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
