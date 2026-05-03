package com.caglar.stock.repository;

import com.caglar.stock.entity.Stock;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface StockRepository extends MongoRepository<Stock, String>, StockRepositoryCustom {

    Optional<Stock> findByProductId(String productId);
}
