package com.caglar.product.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;

import java.time.Instant;

@Builder
public record SetFlashDealRequestDto(
        @NotNull Instant flashDealEndsAt
) {}
