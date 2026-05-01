package com.caglar.product.mapper;

import com.caglar.product.entity.Review;
import com.caglar.product.dto.request.CreateReviewRequestDto;
import com.caglar.product.dto.response.ReviewResponseDto;

public final class ReviewMapper {

    private static final String ANONYMOUS_AUTHOR = "Anonim";

    private ReviewMapper() {}

    public static ReviewResponseDto toResponse(Review r) {
        return ReviewResponseDto.builder()
                .id(r.getId())
                .productId(r.getProductId())
                .authorAuthId(r.getAuthorAuthId())
                .authorName(r.getAuthorName())
                .rating(r.getRating())
                .title(r.getTitle())
                .comment(r.getComment())
                .createdAt(r.getCreatedAtUtc())
                .build();
    }

    public static Review fromCreateRequest(Long authId, String authorName, CreateReviewRequestDto dto) {
        return Review.builder()
                .productId(dto.productId())
                .authorAuthId(authId)
                .authorName(authorName == null ? ANONYMOUS_AUTHOR : authorName)
                .rating(dto.rating())
                .title(dto.title())
                .comment(dto.comment())
                .build();
    }
}
