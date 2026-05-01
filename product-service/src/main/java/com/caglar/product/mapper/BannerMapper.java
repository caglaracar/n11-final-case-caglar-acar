package com.caglar.product.mapper;

import com.caglar.product.entity.Banner;
import com.caglar.product.dto.request.CreateBannerRequestDto;
import com.caglar.product.dto.response.BannerResponseDto;

public final class BannerMapper {

    private BannerMapper() {}

    public static Banner fromCreateRequest(CreateBannerRequestDto dto) {
        return Banner.builder()
                .eyebrow(dto.eyebrow())
                .title(dto.title())
                .subtitle(dto.subtitle())
                .ctaLabel(dto.ctaLabel())
                .ctaHref(dto.ctaHref())
                .imageUrl(dto.imageUrl())
                .badge(dto.badge())
                .sortOrder(dto.sortOrder() == null ? 0 : dto.sortOrder())
                .active(dto.active() == null || dto.active())
                .build();
    }

    public static BannerResponseDto toResponse(Banner b) {
        return BannerResponseDto.builder()
                .id(b.getId())
                .eyebrow(b.getEyebrow())
                .title(b.getTitle())
                .subtitle(b.getSubtitle())
                .ctaLabel(b.getCtaLabel())
                .ctaHref(b.getCtaHref())
                .imageUrl(b.getImageUrl())
                .badge(b.getBadge())
                .sortOrder(b.getSortOrder())
                .active(b.isActive())
                .createdAt(b.getCreatedAtUtc())
                .updatedAt(b.getUpdatedAtUtc())
                .build();
    }
}
