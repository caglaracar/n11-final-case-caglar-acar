package com.caglar.product.repository;

import com.caglar.product.entity.Brand;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface BrandRepository extends MongoRepository<Brand, String> {
    boolean existsByName(String name);
}
