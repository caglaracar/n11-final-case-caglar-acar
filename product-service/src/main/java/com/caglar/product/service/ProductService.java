package com.caglar.product.service;

import com.caglar.product.dto.request.CreateProductRequestDto;
import com.caglar.product.dto.request.UpdateProductRequestDto;
import com.caglar.product.dto.response.ProductResponseDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ProductService {

    ProductResponseDto create(CreateProductRequestDto dto, Long sellerAuthId);

    ProductResponseDto update(String productId, UpdateProductRequestDto dto);

    void remove(String productId);

    ProductResponseDto getById(String productId);

    Page<ProductResponseDto> getList(String q, String categoryId, String brandId, Pageable pageable);

    List<ProductResponseDto> getPopularList(int limit);

    List<ProductResponseDto> getPriceDropList(int limit);

    List<ProductResponseDto> getFlashDealList();
}
