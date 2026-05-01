package com.caglar.product.service;

import com.caglar.product.dto.response.TrendingTermResponseDto;

import java.util.Collection;
import java.util.List;
import java.util.Map;

/**
 * Arama istatistikleri (Redis ZSET tabanlı). Yazma fire-and-forget;
 * Redis arızası ürün listesini bozmamalı.
 */
public interface SearchStatsService {

    /** Arama metnini sayar. Null/çok kısa metinler yutulur. */
    void recordTerm(String rawQuery);

    /** Arama sonucundaki ürünlerin "search hit" sayısını +1 artırır. */
    void recordProductHits(Collection<String> productIds);

    /** Tek ürün için search hit (yoksa 0). */
    long getProductHits(String productId);

    /** Çoklu ürün için search hit map'i. */
    Map<String, Long> getProductHitsMap(Collection<String> productIds);

    /** En çok aranan terimleri (azalan) döner. */
    List<TrendingTermResponseDto> topTerms(int limit);
}
