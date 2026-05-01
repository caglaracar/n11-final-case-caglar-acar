package com.caglar.product.entity;

import com.caglar.common.entity.BaseDocument;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.util.StringUtils;

/**
 * Ana sayfa hero/promosyon banner'ı. Admin panelinden tamamen yönetilir.
 * Public uçtan sadece {@code active=true} kayıtlar listelenir.
 */
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "banner")
public class Banner extends BaseDocument {

    /** Üst başlık veya kategori etiketi. Örn: "Teknoloji Ürünleri". */
    private String eyebrow;

    /** Ana başlık. Örn: "%30'a Varan İndirim". */
    private String title;

    /** Alt metin / açıklama. */
    private String subtitle;

    /** Çağrı butonu metni. */
    private String ctaLabel;

    /** Buton tıklanınca gidilecek path veya tam URL. */
    private String ctaHref;

    /** Görsel URL'i. */
    private String imageUrl;

    /** Köşedeki rozet metni (opsiyonel). Örn: "YENİ", "%50". */
    private String badge;

    /** Sıralama değeri — küçük olan önce gösterilir. */
    @Builder.Default
    private int sortOrder = 0;

    /** Pasif yapılırsa public uca gönderilmez. */
    @Builder.Default
    private boolean active = true;

    /** PATCH semantiği — sadece null/blank olmayan alanlar güncellenir. */
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
