package com.caglar.product.dto.request;

import lombok.Builder;
import org.springframework.util.StringUtils;

@Builder
public record ProductSearchFilter(
        String q,
        String categoryId,
        String brandId
) {
    public static ProductSearchFilter of(String q, String categoryId, String brandId) {
        return new ProductSearchFilter(q, categoryId, brandId);
    }

    public boolean hasQ()        { return StringUtils.hasText(q); }
    public boolean hasCategory() { return StringUtils.hasText(categoryId); }
    public boolean hasBrand()    { return StringUtils.hasText(brandId); }
}
