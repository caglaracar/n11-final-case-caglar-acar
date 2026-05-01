package com.caglar.product.repository;

import com.caglar.product.entity.Product;
import com.caglar.product.repository.search.ProductSearchRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.Instant;
import java.util.List;

public interface ProductRepository extends MongoRepository<Product, String>, ProductSearchRepository {

    boolean existsByCategoryId(String categoryId);

    boolean existsByBrand(String brand);

    List<Product> findTopByOrderByViewCountDesc(Pageable pageable);

    List<Product> findByPriceDropAtIsNotNullOrderByPriceDropAtDesc(Pageable pageable);

    List<Product> findByFlashDealEndsAtAfter(Instant now);
}
