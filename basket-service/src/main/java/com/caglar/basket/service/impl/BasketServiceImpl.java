package com.caglar.basket.service.impl;

import com.caglar.basket.dto.request.AddToBasketRequestDto;
import com.caglar.basket.dto.request.UpdateBasketItemRequestDto;
import com.caglar.basket.dto.response.BasketResponseDto;
import com.caglar.basket.mapper.BasketMapper;
import com.caglar.basket.entity.Basket;
import com.caglar.basket.service.BasketService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class BasketServiceImpl implements BasketService {

    private static final String KEY_PREFIX = "basket:";

    private final RedisTemplate<String, Object> redisTemplate;

    @Value("${basket.ttl-seconds:86400}")
    private long ttlSeconds;

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
        redisTemplate.delete(key(authId));
    }

    private Basket loadOrEmpty(Long authId) {
        Object value = redisTemplate.opsForValue().get(key(authId));
        if (value instanceof Basket basket) {
            return basket;
        }
        return Basket.builder()
                .authId(authId)
                .items(new ArrayList<>())
                .build();
    }

    private Basket persist(Basket basket) {
        basket.setUpdatedAt(Instant.now().toEpochMilli());
        redisTemplate.opsForValue()
                .set(key(basket.getAuthId()), basket, Duration.ofSeconds(ttlSeconds));
        return basket;
    }

    private String key(Long authId) {
        return KEY_PREFIX + authId;
    }
}
