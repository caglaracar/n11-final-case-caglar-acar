package com.caglar.product.dto.response;

import lombok.Builder;

import java.time.Instant;

@Builder
public record ReviewResponseDto(
        String id,
        String productId,
        Long authorAuthId,
        String authorName,
        Integer rating,
        String title,
        String comment,
        Instant createdAt
) {}
