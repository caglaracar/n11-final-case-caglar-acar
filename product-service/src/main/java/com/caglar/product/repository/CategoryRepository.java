package com.caglar.product.repository;

import com.caglar.product.entity.Category;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface CategoryRepository extends MongoRepository<Category, String> {
    boolean existsByName(String name);
}
