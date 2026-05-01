package com.caglar.product.dto.request;

import lombok.Builder;

/** Tüm alanlar opsiyonel — gönderilmeyenler değiştirilmez. */
@Builder
public record UpdateBannerRequestDto(
        String eyebrow,
        String title,
        String subtitle,
        String ctaLabel,
        String ctaHref,
        String imageUrl,
        String badge,
        Integer sortOrder,
        Boolean active
) {}
