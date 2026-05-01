package com.caglar.product.repository;

import com.caglar.product.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ReviewRepository extends MongoRepository<Review, String> {
    Page<Review> findByProductId(String productId, Pageable pageable);
    List<Review> findByProductId(String productId);
    long countByProductId(String productId);
    boolean existsByProductIdAndAuthorAuthId(String productId, Long authorAuthId);
}
