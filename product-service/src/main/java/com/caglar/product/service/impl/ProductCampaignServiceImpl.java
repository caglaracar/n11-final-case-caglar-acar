package com.caglar.product.service.impl;

import com.caglar.common.exception.BusinessException;
import com.caglar.common.exception.ErrorType;
import com.caglar.product.dto.request.ApplyPriceDropRequestDto;
import com.caglar.product.dto.request.SetFlashDealRequestDto;
import com.caglar.product.dto.response.ProductResponseDto;
import com.caglar.product.entity.Product;
import com.caglar.product.mapper.ProductMapper;
import com.caglar.product.repository.ProductRepository;
import com.caglar.product.service.ProductCampaignService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductCampaignServiceImpl implements ProductCampaignService {

    private final ProductRepository productRepository;

    @Override
    public ProductResponseDto setFlashDeal(String productId, SetFlashDealRequestDto dto) {
        if (!dto.flashDealEndsAt().isAfter(Instant.now())) {
            throw new BusinessException(ErrorType.INVALID_ARGUMENT, "Bitiş zamanı gelecekte olmalı");
        }
        Product product = requireProduct(productId);
        product.startFlashDeal(dto.flashDealEndsAt());
        return ProductMapper.toResponse(productRepository.save(product));
    }

    @Override
    public ProductResponseDto clearFlashDeal(String productId) {
        Product product = requireProduct(productId);
        product.clearFlashDeal();
        return ProductMapper.toResponse(productRepository.save(product));
    }

    @Override
    public ProductResponseDto applyPriceDrop(String productId, ApplyPriceDropRequestDto dto) {
        Product product = requireProduct(productId);
        try {
            product.applyPriceDrop(dto.price(), dto.originalPrice());
        } catch (IllegalArgumentException e) {
            throw new BusinessException(ErrorType.INVALID_ARGUMENT, e.getMessage());
        }
        return ProductMapper.toResponse(productRepository.save(product));
    }

    @Override
    public ProductResponseDto clearPriceDrop(String productId) {
        Product product = requireProduct(productId);
        product.clearPriceDrop();
        return ProductMapper.toResponse(productRepository.save(product));
    }

    private Product requireProduct(String id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorType.NOT_FOUND, "Ürün bulunamadı"));
    }
}
