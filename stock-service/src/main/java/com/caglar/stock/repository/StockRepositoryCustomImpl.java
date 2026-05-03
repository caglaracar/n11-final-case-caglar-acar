package com.caglar.stock.repository;

import com.caglar.stock.entity.Stock;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class StockRepositoryCustomImpl implements StockRepositoryCustom {

    private final MongoTemplate mongoTemplate;

    @Override
    public Stock decrementIfSufficient(String productId, int quantity) {
        Query query = new Query(Criteria.where("productId").is(productId).and("quantity").gte(quantity));
        Update update = new Update().inc("quantity", -quantity);
        return mongoTemplate.findAndModify(query, update, Stock.class);
    }

    @Override
    public void increment(String productId, int quantity) {
        Query query = new Query(Criteria.where("productId").is(productId));
        Update update = new Update().inc("quantity", quantity);
        mongoTemplate.updateFirst(query, update, Stock.class);
    }

    @Override
    public boolean existsByProductId(String productId) {
        return mongoTemplate.exists(new Query(Criteria.where("productId").is(productId)), Stock.class);
    }

    @Override
    public Stock findStockByProductId(String productId) {
        return mongoTemplate.findOne(new Query(Criteria.where("productId").is(productId)), Stock.class);
    }

    @Override
    public void upsert(String productId, int quantity) {
        Query query = new Query(Criteria.where("productId").is(productId));
        Update update = new Update().set("quantity", quantity).set("productId", productId);
        mongoTemplate.upsert(query, update, Stock.class);
    }
}
