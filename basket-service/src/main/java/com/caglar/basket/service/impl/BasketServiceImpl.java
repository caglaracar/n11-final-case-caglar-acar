package com.caglar.basket.service.impl;

import com.caglar.basket.dto.request.AddToBasketRequestDto;
import com.caglar.basket.dto.request.UpdateBasketItemRequestDto;
import com.caglar.basket.dto.response.BasketResponseDto;
import com.caglar.basket.entity.Basket;
import com.caglar.basket.mapper.BasketMapper;
import com.caglar.basket.repository.BasketRepository;
import com.caglar.basket.service.BasketService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class BasketServiceImpl implements BasketService {

    private final BasketRepository basketRepository;

    @Override
    public BasketResponseDto getMyBasket(Long authId) {
        return BasketMapper.toResponse(loadOrEmpty(authId));
    }

    @Override
    public BasketResponseDto addItem(Long authId, AddToBasketRequestDto dto) {
        Basket basket = loadOrEmpty(authId);
        basket.addOrMergeItem(BasketMapper.fromAddRequest(dto));
        return BasketMapper.toResponse(persist(basket));
    }

    @Override
    public BasketResponseDto updateItem(Long authId, UpdateBasketItemRequestDto dto) {
        Basket basket = loadOrEmpty(authId);
        basket.changeQuantity(dto.productId(), dto.quantity());
        return BasketMapper.toResponse(persist(basket));
    }

    @Override
    public BasketResponseDto removeItem(Long authId, String productId) {
        Basket basket = loadOrEmpty(authId);
        basket.removeItem(productId);
        return BasketMapper.toResponse(persist(basket));
    }

    @Override
    public void clear(Long authId) {
        basketRepository.deleteByAuthId(authId);
    }

    private Basket loadOrEmpty(Long authId) {
        return basketRepository.findByAuthId(authId)
                .orElseGet(() -> Basket.builder()
                        .authId(authId)
                        .items(new ArrayList<>())
                        .build());
    }

    private Basket persist(Basket basket) {
        basket.setUpdatedAt(Instant.now().toEpochMilli());
        return basketRepository.save(basket);
    }
}
