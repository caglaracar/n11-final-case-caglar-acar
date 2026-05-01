package com.caglar.product.dto.response;

import lombok.Builder;

import java.time.Instant;

@Builder
public record BlogPostResponseDto(
        String id,
        String slug,
        String title,
        String excerpt,
        String content,
        String category,
        String image,
        String author,
        Integer readMinutes,
        Instant createdAt,
        Instant updatedAt
) {}
