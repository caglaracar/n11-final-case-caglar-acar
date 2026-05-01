package com.caglar.product.repository;

import com.caglar.product.entity.Banner;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface BannerRepository extends MongoRepository<Banner, String> {

    List<Banner> findAllByActiveTrue(Sort sort);
}
