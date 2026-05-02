package com.caglar.product.service.impl;

import com.caglar.common.util.LimitUtil;
import com.caglar.product.config.ProductLimitsProperties;
import com.caglar.product.dto.response.ProductResponseDto;
import com.caglar.product.entity.Product;
import com.caglar.product.mapper.ProductMapper;
import com.caglar.product.repository.ProductRepository;
import com.caglar.product.service.ProductCatalogService;
import com.caglar.product.service.SearchStatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductCatalogServiceImpl implements ProductCatalogService {

    private final ProductRepository productRepository;
    private final ProductLimitsProperties limits;
    private final SearchStatsService searchStatsService;

    @Override
    public List<ProductResponseDto> getPopularList(int limit) {
        int n = LimitUtil.clamp(limit, limits.popular().defaultValue(), limits.popular().max());

        List<String> redisIds = searchStatsService.topPopularProductIds(n);
        LinkedHashMap<String, ProductResponseDto> ordered = new LinkedHashMap<>();

        if (!redisIds.isEmpty()) {
            Iterable<Product> products = productRepository.findAllById(redisIds);
            Map<String, Product> byId = new HashMap<>();
            products.forEach(p -> byId.put(p.getId(), p));
            for (String id : redisIds) {
                Product p = byId.get(id);
                if (p != null) {
                    ordered.put(id, ProductMapper.toResponse(p));
                }
            }
        }

        if (ordered.size() < n) {
            int missing = n - ordered.size();
            List<Product> fallback = productRepository.findTopByOrderByViewCountDesc(PageRequest.of(0, n + missing));
            for (Product p : fallback) {
                if (!ordered.containsKey(p.getId())) {
                    ordered.put(p.getId(), ProductMapper.toResponse(p));
                    if (ordered.size() >= n) break;
                }
            }
        }

        return new ArrayList<>(ordered.values());
    }

    @Override
    public List<ProductResponseDto> getPriceDropList(int limit) {
        int n = LimitUtil.clamp(limit, limits.priceDrop().defaultValue(), limits.priceDrop().max());
        return productRepository.findByPriceDropAtIsNotNullOrderByPriceDropAtDesc(PageRequest.of(0, n))
                .stream().map(ProductMapper::toResponse).toList();
    }

    @Override
    public List<ProductResponseDto> getFlashDealList() {
        return productRepository.findByFlashDealEndsAtAfter(Instant.now())
                .stream().map(ProductMapper::toResponse).toList();
    }
}
