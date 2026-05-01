package com.caglar.basket.service;

import com.caglar.basket.dto.request.AddToBasketRequestDto;
import com.caglar.basket.dto.request.UpdateBasketItemRequestDto;
import com.caglar.basket.dto.response.BasketResponseDto;

public interface BasketService {

    BasketResponseDto getMyBasket(Long authId);

    BasketResponseDto addItem(Long authId, AddToBasketRequestDto dto);

    BasketResponseDto updateItem(Long authId, UpdateBasketItemRequestDto dto);

    BasketResponseDto removeItem(Long authId, String productId);

    void clear(Long authId);
}
