package com.caglar.product.entity;

import com.caglar.common.entity.BaseDocument;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "product")
public class Product extends BaseDocument {

    @Indexed
    private String name;

    private String description;

    private Double price;

    private Double originalPrice;

    private String currency;

    @Indexed
    private String categoryId;

    private String subcategory;

    private String brand;

    private Integer stock;

    private String imageUrl;

    @Builder.Default
    private List<String> images = new ArrayList<>();

    private String badge;

    @Builder.Default
    private List<String> features = new ArrayList<>();

    private Long sellerAuthId;

    @Builder.Default
    private Long viewCount = 0L;

    private Instant flashDealEndsAt;

    private Instant priceDropAt;

    public void incrementViewCount() {
        this.viewCount = (viewCount == null ? 0L : viewCount) + 1L;
    }

    public void applyUpdate(String name, String description, Double price,
                            String categoryId, String subcategory, String brand, Integer stock,
                            String imageUrl, List<String> images, String badge, List<String> features) {
        if (StringUtils.hasText(name)) {
            this.name = name;
        }
        if (description != null) {
            this.description = description;
        }
        if (price != null) {
            this.price = price;
        }
        if (StringUtils.hasText(categoryId)) {
            this.categoryId = categoryId;
        }
        if (subcategory != null) {
            this.subcategory = subcategory;
        }
        if (brand != null) {
            this.brand = brand;
        }
        if (stock != null) {
            this.stock = stock;
        }
        if (imageUrl != null) {
            this.imageUrl = imageUrl;
        }
        if (images != null) {
            this.images = new ArrayList<>(images);
        }
        if (badge != null) {
            this.badge = badge;
        }
        if (features != null) {
            this.features = new ArrayList<>(features);
        }
    }

    public void startFlashDeal(Instant endsAt) {
        this.flashDealEndsAt = endsAt;
    }

    public void clearFlashDeal() {
        this.flashDealEndsAt = null;
    }

    public void applyPriceDrop(double newPrice, Double newOriginalPrice) {
        double reference = newOriginalPrice != null ? newOriginalPrice
                : (this.originalPrice != null && this.originalPrice > 0 ? this.originalPrice : (this.price != null ? this.price : newPrice));
        if (newPrice >= reference) {
            throw new IllegalArgumentException("Yeni fiyat referans fiyattan düşük olmalı");
        }
        this.originalPrice = reference;
        this.price = newPrice;
        this.priceDropAt = Instant.now();
    }

    public void clearPriceDrop() {
        this.originalPrice = null;
    }
}
