package com.caglar.product.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Builder;

@Builder
public record CreateBlogPostRequestDto(
        @NotBlank @Size(max = 160) String title,
        @NotBlank String slug,
        @Size(max = 280) String excerpt,
        @NotBlank String content,
        String category,
        String image,
        String author,
        Integer readMinutes
) {}
