package com.caglar.product.dto.response;

import lombok.Builder;

/** En çok aranan terim — Redis ZSET'ten okunur. */
@Builder
public record TrendingTermResponseDto(String term, long count) {}
