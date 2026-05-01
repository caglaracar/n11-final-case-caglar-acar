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

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "category")
public class Category extends BaseDocument {

    @Indexed(unique = true)
    private String name;

    private String description;

    /** URL-friendly slug; null ise client name'i kullanır. */
    private String slug;

    /** Üst navigasyon ve kart ikonları için css/remix-icon class'ı. Örn: "ri-cpu-line". */
    private String iconClass;

    /** Ürün kart vs. tasarımda küçük rozet metni. Örn: "HOT", "YENİ". */
    private String highlightLabel;

    /** Üst navigasyonda gösterilsin mi? Default true. */
    @Builder.Default
    private boolean visibleInNav = true;

    /** Üst nav'daki sıra. Küçük olan önce gelir. */
    @Builder.Default
    private int sortOrder = 0;

    /** PATCH semantiği — sadece null/blank olmayan alanlar güncellenir. */
    public void merge(String name, String description, String slug, String iconClass,
                      String highlightLabel, Boolean visibleInNav, Integer sortOrder) {
        if (StringUtils.hasText(name)) {
            this.name = name;
        }
        if (description != null) {
            this.description = description;
        }
        if (slug != null) {
            this.slug = slug;
        }
        if (iconClass != null) {
            this.iconClass = iconClass;
        }
        if (highlightLabel != null) {
            this.highlightLabel = highlightLabel;
        }
        if (visibleInNav != null) {
            this.visibleInNav = visibleInNav;
        }
        if (sortOrder != null) {
            this.sortOrder = sortOrder;
        }
    }
}
