package com.caglar.product.dto.response;

import lombok.Builder;

@Builder
public record TrendingTermResponseDto(String term, long count) {}
