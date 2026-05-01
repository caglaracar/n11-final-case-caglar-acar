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

    /** İndirim öncesi liste fiyatı. null → indirim yok. */
    private Double originalPrice;

    private String currency;

    @Indexed
    private String categoryId;

    /** Audio, Footwear, Kitchen vb. */
    private String subcategory;

    private String brand;

    private Integer stock;

    /** Geriye uyum: ana görsel. */
    private String imageUrl;

    /** Lightbox için galeri. */
    @Builder.Default
    private List<String> images = new ArrayList<>();

    /** "Best Seller" / "Sale" / "New Arrival" / null. */
    private String badge;

    /** Bullet feature list. */
    @Builder.Default
    private List<String> features = new ArrayList<>();

    /** Review service tarafından güncellenir. */
    @Builder.Default
    private Double rating = 0d;

    @Builder.Default
    private Integer reviewCount = 0;

    private Long sellerAuthId;

    /** Detay sayfa görüntülenme sayacı. */
    @Builder.Default
    private Long viewCount = 0L;

    /** Flash deal kampanyasının bitiş zamanı (UTC). null → kampanya yok. */
    private Instant flashDealEndsAt;

    /** Son fiyat düşüşü zamanı (UTC). Admin price < önceki price olduğunda set edilir. */
    private Instant priceDropAt;

    /** Detay sayfası her görüntülendiğinde çağrılır. */
    public void incrementViewCount() {
        this.viewCount = (viewCount == null ? 0L : viewCount) + 1L;
    }

    /** PATCH semantiği. Yeni fiyat eskiden düşükse priceDropAt damgalanır. */
    public void applyUpdate(String name, String description, Double price, Double originalPrice,
                            String categoryId, String subcategory, String brand, Integer stock,
                            String imageUrl, List<String> images, String badge, List<String> features,
                            Instant flashDealEndsAt) {
        if (StringUtils.hasText(name)) {
            this.name = name;
        }
        if (description != null) {
            this.description = description;
        }
        if (price != null) {
            updatePrice(price);
        }
        if (originalPrice != null) {
            this.originalPrice = originalPrice;
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
        if (flashDealEndsAt != null) {
            this.flashDealEndsAt = flashDealEndsAt;
        }
    }

    private void updatePrice(double newPrice) {
        if (this.price != null && newPrice < this.price) {
            this.priceDropAt = Instant.now();
        }
        this.price = newPrice;
    }
}
