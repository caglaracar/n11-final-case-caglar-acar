package com.caglar.product.stock;

public interface StockService {

    void reserve(StockOpRequestDto dto);

    void release(StockOpRequestDto dto);
}
