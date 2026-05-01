package com.caglar.product.repository.search;

import com.caglar.product.entity.Product;
import com.caglar.product.dto.request.ProductSearchFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.support.PageableExecutionUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

/**
 * MongoTemplate + Criteria ile dinamik arama. Yeni filtre eklemek için sadece
 * {@link #buildCriteria(ProductSearchFilter)} içine yeni bir satır eklenir.
 */
@RequiredArgsConstructor
public class ProductSearchRepositoryImpl implements ProductSearchRepository {

    private final MongoTemplate mongoTemplate;

    @Override
    public Page<Product> search(ProductSearchFilter filter, Pageable pageable) {
        Query query = buildCriteria(filter);
        List<Product> content = mongoTemplate.find(Query.of(query).with(pageable), Product.class);
        return PageableExecutionUtils.getPage(content, pageable,
                () -> mongoTemplate.count(query, Product.class));
    }

    private static Query buildCriteria(ProductSearchFilter f) {
        List<Criteria> and = new ArrayList<>();
        if (f.hasQ()) {
            and.add(Criteria.where("name").regex(Pattern.quote(f.q()), "i"));
        }
        if (f.hasCategory()) {
            and.add(Criteria.where("categoryId").is(f.categoryId()));
        }
        if (f.hasBrand()) {
            and.add(Criteria.where("brand").is(f.brandId()));
        }
        Query query = new Query();
        if (!and.isEmpty()) {
            query.addCriteria(new Criteria().andOperator(and.toArray(Criteria[]::new)));
        }
        return query;
    }
}
