package com.caglar.product.repository;

import com.caglar.product.entity.BlogPost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface BlogPostRepository extends MongoRepository<BlogPost, String> {
    Page<BlogPost> findByPublishedTrue(Pageable pageable);
    Optional<BlogPost> findBySlug(String slug);
}
