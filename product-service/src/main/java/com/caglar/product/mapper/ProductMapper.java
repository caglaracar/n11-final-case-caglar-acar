package com.caglar.product.mapper;

import com.caglar.product.entity.Brand;
import com.caglar.product.entity.Category;
import com.caglar.product.entity.Product;
import com.caglar.product.dto.request.CreateBrandRequestDto;
import com.caglar.product.dto.request.CreateCategoryRequestDto;
import com.caglar.product.dto.request.CreateProductRequestDto;
import com.caglar.product.dto.response.BrandResponseDto;
import com.caglar.product.dto.response.CategoryResponseDto;
import com.caglar.product.dto.response.ProductResponseDto;

import java.util.ArrayList;

public final class ProductMapper {

    private ProductMapper() {}

    public static ProductResponseDto toResponse(Product p) {
        return toResponse(p, null);
    }

    public static ProductResponseDto toResponse(Product p, Long searchCount) {
        return ProductResponseDto.builder()
                .id(p.getId())
                .name(p.getName())
                .description(p.getDescription())
                .price(p.getPrice())
                .originalPrice(p.getOriginalPrice())
                .currency(p.getCurrency())
                .categoryId(p.getCategoryId())
                .subcategory(p.getSubcategory())
                .brand(p.getBrand())
                .stock(p.getStock())
                .imageUrl(p.getImageUrl())
                .images(p.getImages())
                .badge(p.getBadge())
                .features(p.getFeatures())
                .sellerAuthId(p.getSellerAuthId())
                .viewCount(p.getViewCount() == null ? 0L : p.getViewCount())
                .searchCount(searchCount == null ? 0L : searchCount)
                .flashDealEndsAt(p.getFlashDealEndsAt())
                .priceDropAt(p.getPriceDropAt())
                .createdAt(p.getCreatedAtUtc())
                .updatedAt(p.getUpdatedAtUtc())
                .build();
    }

    public static Product fromCreateRequest(CreateProductRequestDto dto, Long sellerAuthId) {
        return Product.builder()
                .name(dto.name())
                .description(dto.description())
                .price(dto.price())
                .originalPrice(dto.originalPrice())
                .currency(dto.currency())
                .categoryId(dto.categoryId())
                .subcategory(dto.subcategory())
                .brand(dto.brand())
                .stock(dto.stock())
                .imageUrl(dto.imageUrl())
                .images(dto.images() == null ? new ArrayList<>() : new ArrayList<>(dto.images()))
                .badge(dto.badge())
                .features(dto.features() == null ? new ArrayList<>() : new ArrayList<>(dto.features()))
                .sellerAuthId(sellerAuthId)
                .build();
    }

    public static CategoryResponseDto toResponse(Category c) {
        return CategoryResponseDto.builder()
                .id(c.getId())
                .name(c.getName())
                .description(c.getDescription())
                .slug(c.getSlug())
                .iconClass(c.getIconClass())
                .highlightLabel(c.getHighlightLabel())
                .visibleInNav(c.isVisibleInNav())
                .sortOrder(c.getSortOrder())
                .build();
    }

    public static Category fromCreateRequest(CreateCategoryRequestDto dto) {
        return Category.builder()
                .name(dto.name())
                .description(dto.description())
                .slug(dto.slug())
                .iconClass(dto.iconClass())
                .highlightLabel(dto.highlightLabel())
                .visibleInNav(dto.visibleInNav() == null || dto.visibleInNav())
                .sortOrder(dto.sortOrder() == null ? 0 : dto.sortOrder())
                .build();
    }

    public static BrandResponseDto toResponse(Brand b) {
        return BrandResponseDto.builder()
                .id(b.getId())
                .name(b.getName())
                .description(b.getDescription())
                .slug(b.getSlug())
                .logoUrl(b.getLogoUrl())
                .active(b.isActive())
                .sortOrder(b.getSortOrder())
                .build();
    }

    public static Brand fromCreateRequest(CreateBrandRequestDto dto) {
        return Brand.builder()
                .name(dto.name())
                .description(dto.description())
                .slug(dto.slug())
                .logoUrl(dto.logoUrl())
                .active(dto.active() == null || dto.active())
                .sortOrder(dto.sortOrder() == null ? 0 : dto.sortOrder())
                .build();
    }
}
