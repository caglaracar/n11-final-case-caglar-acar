package com.caglar.stock.service;

import com.caglar.stock.dto.request.StockOpRequestDto;
import com.caglar.stock.dto.response.StockResponseDto;

public interface StockService {

    void reserve(StockOpRequestDto dto);

    void release(StockOpRequestDto dto);

    StockResponseDto getByProductId(String productId);

    StockResponseDto set(String productId, int quantity);
}
