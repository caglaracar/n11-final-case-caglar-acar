package com.caglar.product.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;

@Builder
public record CreateReviewRequestDto(
        @NotBlank String productId,
        @NotNull @Min(1) @Max(5) Integer rating,
        @Size(max = 120) String title,
        @NotBlank @Size(max = 2000) String comment
) {}
