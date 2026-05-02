package com.caglar.product.stock;

import com.caglar.common.exception.BusinessException;
import com.caglar.common.exception.ErrorType;
import com.caglar.product.entity.Product;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

/**
 * Stok rezerve/release servisi.
 * Atomik {@code findAndModify(stock >= qty, $inc stock=-qty)} kullanılarak yarış koşulları engellenir.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class StockServiceImpl implements StockService {

    private final MongoTemplate mongoTemplate;

    @Override
    @Transactional
    public void reserve(StockOpRequestDto dto) {
        List<StockOpRequestDto.Item> applied = new ArrayList<>();
        for (StockOpRequestDto.Item item : dto.items()) {
            Query query = new Query(Criteria.where("_id").is(item.productId())
                    .and("stock").gte(item.quantity()));
            Update update = new Update().inc("stock", -item.quantity());
            Product updated = mongoTemplate.findAndModify(query, update, Product.class);
            if (updated == null) {
                rollback(applied);
                throw new BusinessException(ErrorType.PRODUCT_OUT_OF_STOCK,
                        "Yetersiz stok: productId=" + item.productId());
            }
            applied.add(item);
        }
        log.info("Stock reserved orderId={} items={}", dto.orderId(), dto.items().size());
    }

    @Override
    @Transactional
    public void release(StockOpRequestDto dto) {
        for (StockOpRequestDto.Item item : dto.items()) {
            Query query = new Query(Criteria.where("_id").is(item.productId()));
            Update update = new Update().inc("stock", item.quantity());
            mongoTemplate.updateFirst(query, update, Product.class);
        }
        log.info("Stock released orderId={} items={}", dto.orderId(), dto.items().size());
    }

    private void rollback(List<StockOpRequestDto.Item> applied) {
        for (StockOpRequestDto.Item item : applied) {
            Query query = new Query(Criteria.where("_id").is(item.productId()));
            Update update = new Update().inc("stock", item.quantity());
            mongoTemplate.updateFirst(query, update, Product.class);
        }
    }
}
