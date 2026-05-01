package com.caglar.basket.dto.response;

import com.caglar.basket.entity.BasketItem;
import lombok.Builder;

import java.util.List;

@Builder
public record BasketResponseDto(
        Long authId,
        List<BasketItem> items,
        Double total,
        Long updatedAt
) {}
