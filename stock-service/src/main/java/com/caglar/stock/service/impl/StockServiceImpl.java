package com.caglar.stock.service.impl;

import com.caglar.common.exception.BusinessException;
import com.caglar.common.exception.ErrorType;
import com.caglar.stock.dto.request.StockOpRequestDto;
import com.caglar.stock.dto.response.StockResponseDto;
import com.caglar.stock.entity.Stock;
import com.caglar.stock.repository.StockRepository;
import com.caglar.stock.service.StockService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class StockServiceImpl implements StockService {

    private final StockRepository stockRepository;

    @Override
    public void reserve(StockOpRequestDto dto) {
        List<StockOpRequestDto.Item> applied = new ArrayList<>();
        for (StockOpRequestDto.Item item : dto.items()) {
            Stock updated = stockRepository.decrementIfSufficient(item.productId(), item.quantity());
            if (updated == null) {
                if (stockRepository.existsByProductId(item.productId())) {
                    rollback(applied);
                    throw new BusinessException(ErrorType.PRODUCT_OUT_OF_STOCK,
                            "Yetersiz stok: productId=" + item.productId());
                }
                log.info("Stock record missing for productId={}, skipping", item.productId());
                continue;
            }
            applied.add(item);
        }
        log.info("Stock reserved orderId={} items={}", dto.orderId(), dto.items().size());
    }

    @Override
    public void release(StockOpRequestDto dto) {
        dto.items().forEach(item -> stockRepository.increment(item.productId(), item.quantity()));
        log.info("Stock released orderId={} items={}", dto.orderId(), dto.items().size());
    }

    @Override
    public StockResponseDto getByProductId(String productId) {
        Stock stock = stockRepository.findStockByProductId(productId);
        return new StockResponseDto(productId, stock != null ? stock.getQuantity() : 0);
    }

    @Override
    public StockResponseDto set(String productId, int quantity) {
        stockRepository.upsert(productId, quantity);
        log.info("Stock set productId={} quantity={}", productId, quantity);
        return new StockResponseDto(productId, quantity);
    }

    private void rollback(List<StockOpRequestDto.Item> applied) {
        applied.forEach(item -> stockRepository.increment(item.productId(), item.quantity()));
    }
}
