package com.caglar.stock.service.impl;

import com.caglar.common.exception.BusinessException;
import com.caglar.common.exception.ErrorType;
import com.caglar.stock.dto.request.StockOpRequestDto;
import com.caglar.stock.dto.response.StockResponseDto;
import com.caglar.stock.entity.Stock;
import com.caglar.stock.service.StockService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class StockServiceImpl implements StockService {

    private final MongoTemplate mongoTemplate;

    @Override
    public void reserve(StockOpRequestDto dto) {
        List<StockOpRequestDto.Item> applied = new ArrayList<>();
        for (StockOpRequestDto.Item item : dto.items()) {
            Query query = new Query(
                    Criteria.where("productId").is(item.productId())
                            .and("quantity").gte(item.quantity()));
            Update update = new Update().inc("quantity", -item.quantity());
            Stock updated = mongoTemplate.findAndModify(query, update, Stock.class);
            if (updated == null) {
                // Kayıt yok → stok takibi yapılmıyor, geç
                // Kayıt var ama yetersiz → blokla
                boolean exists = mongoTemplate.exists(
                        new Query(Criteria.where("productId").is(item.productId())), Stock.class);
                if (exists) {
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
        for (StockOpRequestDto.Item item : dto.items()) {
            Query query = new Query(Criteria.where("productId").is(item.productId()));
            Update update = new Update().inc("quantity", item.quantity());
            mongoTemplate.updateFirst(query, update, Stock.class);
        }
        log.info("Stock released orderId={} items={}", dto.orderId(), dto.items().size());
    }

    @Override
    public StockResponseDto getByProductId(String productId) {
        Query query = new Query(Criteria.where("productId").is(productId));
        Stock stock = mongoTemplate.findOne(query, Stock.class);
        int qty = stock != null ? stock.getQuantity() : 0;
        return new StockResponseDto(productId, qty);
    }

    @Override
    public StockResponseDto set(String productId, int quantity) {
        Query query = new Query(Criteria.where("productId").is(productId));
        Update update = new Update().set("quantity", quantity).set("productId", productId);
        mongoTemplate.upsert(query, update, Stock.class);
        log.info("Stock set productId={} quantity={}", productId, quantity);
        return new StockResponseDto(productId, quantity);
    }

    private void rollback(List<StockOpRequestDto.Item> applied) {
        for (StockOpRequestDto.Item item : applied) {
            Query query = new Query(Criteria.where("productId").is(item.productId()));
            Update update = new Update().inc("quantity", item.quantity());
            mongoTemplate.updateFirst(query, update, Stock.class);
        }
    }
}
