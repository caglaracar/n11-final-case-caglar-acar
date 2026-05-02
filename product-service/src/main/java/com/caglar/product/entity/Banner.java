package com.caglar.product.entity;

import com.caglar.common.entity.BaseDocument;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.util.StringUtils;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "banner")
public class Banner extends BaseDocument {

    private String eyebrow;

    private String title;

    private String subtitle;

    private String ctaLabel;

    private String ctaHref;

    private String imageUrl;

    private String badge;

    @Builder.Default
    private int sortOrder = 0;

    @Builder.Default
    private boolean active = true;

    public void merge(String eyebrow, String title, String subtitle, String ctaLabel,
                      String ctaHref, String imageUrl, String badge,
                      Integer sortOrder, Boolean active) {
        if (eyebrow != null) {
            this.eyebrow = eyebrow;
        }
        if (StringUtils.hasText(title)) {
            this.title = title;
        }
        if (subtitle != null) {
            this.subtitle = subtitle;
        }
        if (ctaLabel != null) {
            this.ctaLabel = ctaLabel;
        }
        if (ctaHref != null) {
            this.ctaHref = ctaHref;
        }
        if (StringUtils.hasText(imageUrl)) {
            this.imageUrl = imageUrl;
        }
        if (badge != null) {
            this.badge = badge;
        }
        if (sortOrder != null) {
            this.sortOrder = sortOrder;
        }
        if (active != null) {
            this.active = active;
        }
    }
}
