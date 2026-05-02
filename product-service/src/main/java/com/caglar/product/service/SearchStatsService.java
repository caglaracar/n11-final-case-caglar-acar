package com.caglar.product.service;

import com.caglar.product.dto.response.TrendingTermResponseDto;

import java.util.Collection;
import java.util.List;
import java.util.Map;

public interface SearchStatsService {

    void recordTerm(String rawQuery);

    void recordProductHits(Collection<String> productIds);

    long getProductHits(String productId);

    Map<String, Long> getProductHitsMap(Collection<String> productIds);

    List<TrendingTermResponseDto> topTerms(int limit);

    void recordProductView(String productId);

    List<String> topPopularProductIds(int limit);
}
