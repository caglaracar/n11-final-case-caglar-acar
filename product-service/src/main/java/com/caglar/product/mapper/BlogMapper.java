package com.caglar.product.mapper;

import com.caglar.product.entity.BlogPost;
import com.caglar.product.dto.request.CreateBlogPostRequestDto;
import com.caglar.product.dto.response.BlogPostResponseDto;

public final class BlogMapper {

    private static final int DEFAULT_READ_MINUTES = 5;

    private BlogMapper() {}

    public static BlogPostResponseDto toResponse(BlogPost b) {
        return BlogPostResponseDto.builder()
                .id(b.getId())
                .slug(b.getSlug())
                .title(b.getTitle())
                .excerpt(b.getExcerpt())
                .content(b.getContent())
                .category(b.getCategory())
                .image(b.getImage())
                .author(b.getAuthor())
                .readMinutes(b.getReadMinutes())
                .createdAt(b.getCreatedAtUtc())
                .updatedAt(b.getUpdatedAtUtc())
                .build();
    }

    public static BlogPost fromCreateRequest(CreateBlogPostRequestDto dto) {
        return BlogPost.builder()
                .slug(dto.slug())
                .title(dto.title())
                .excerpt(dto.excerpt())
                .content(dto.content())
                .category(dto.category())
                .image(dto.image())
                .author(dto.author())
                .readMinutes(dto.readMinutes() == null ? DEFAULT_READ_MINUTES : dto.readMinutes())
                .published(true)
                .build();
    }
}
