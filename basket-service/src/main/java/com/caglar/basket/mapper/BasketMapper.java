package com.caglar.basket.mapper;

import com.caglar.basket.dto.request.AddToBasketRequestDto;
import com.caglar.basket.dto.response.BasketResponseDto;
import com.caglar.basket.entity.Basket;
import com.caglar.basket.entity.BasketItem;

public final class BasketMapper {

    private BasketMapper() {}

    public static BasketResponseDto toResponse(Basket basket) {
        return BasketResponseDto.builder()
                .authId(basket.getAuthId())
                .items(basket.getItems())
                .total(basket.total())
                .updatedAt(basket.getUpdatedAt())
                .build();
    }

    public static BasketItem fromAddRequest(AddToBasketRequestDto dto) {
        return BasketItem.builder()
                .productId(dto.productId())
                .productName(dto.productName())
                .quantity(dto.quantity())
                .unitPrice(dto.unitPrice())
                .build();
    }
}
