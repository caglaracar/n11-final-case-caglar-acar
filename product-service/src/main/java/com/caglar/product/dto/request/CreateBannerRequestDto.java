package com.caglar.product.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

@Builder
public record CreateBannerRequestDto(
        String eyebrow,
        @NotBlank String title,
        String subtitle,
        String ctaLabel,
        String ctaHref,
        @NotBlank String imageUrl,
        String badge,
        Integer sortOrder,
        Boolean active
) {}
