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
@Document(collection = "brand")
public class Brand extends BaseDocument {

    @Indexed(unique = true)
    private String name;

    private String description;

    /** URL-friendly slug. */
    private String slug;

    /** Logo URL. */
    private String logoUrl;

    @Builder.Default
    private boolean active = true;

    @Builder.Default
    private int sortOrder = 0;

    /** PATCH semantiği — sadece null/blank olmayan alanlar güncellenir. */
    public void merge(String name, String description, String slug, String logoUrl,
                      Boolean active, Integer sortOrder) {
        if (StringUtils.hasText(name)) {
            this.name = name;
        }
        if (description != null) {
            this.description = description;
        }
        if (slug != null) {
            this.slug = slug;
        }
        if (logoUrl != null) {
            this.logoUrl = logoUrl;
        }
        if (active != null) {
            this.active = active;
        }
        if (sortOrder != null) {
            this.sortOrder = sortOrder;
        }
    }
}
