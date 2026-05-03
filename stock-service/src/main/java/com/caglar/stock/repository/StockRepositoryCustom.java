package com.caglar.stock.repository;

import com.caglar.stock.entity.Stock;

public interface StockRepositoryCustom {

    Stock decrementIfSufficient(String productId, int quantity);

    void increment(String productId, int quantity);

    boolean existsByProductId(String productId);

    Stock findStockByProductId(String productId);

    void upsert(String productId, int quantity);
}
