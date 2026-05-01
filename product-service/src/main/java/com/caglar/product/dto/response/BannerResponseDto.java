package com.caglar.product.dto.response;

import lombok.Builder;

import java.time.Instant;

@Builder
public record BannerResponseDto(
        String id,
        String eyebrow,
        String title,
        String subtitle,
        String ctaLabel,
        String ctaHref,
        String imageUrl,
        String badge,
        int sortOrder,
        boolean active,
        Instant createdAt,
        Instant updatedAt
) {}
