package com.caglar.product.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

@Builder
public record CreateBrandRequestDto(
        @NotBlank String name,
        String description,
        String slug,
        String logoUrl,
        Boolean active,
        Integer sortOrder
) {}
