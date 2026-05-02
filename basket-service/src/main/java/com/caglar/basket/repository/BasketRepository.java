package com.caglar.basket.repository;

import com.caglar.basket.entity.Basket;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface BasketRepository extends MongoRepository<Basket, String> {
    Optional<Basket> findByAuthId(Long authId);
    void deleteByAuthId(Long authId);
}
