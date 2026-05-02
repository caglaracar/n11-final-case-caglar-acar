package com.caglar.product.service;

import com.caglar.product.dto.response.ProductResponseDto;

import java.util.List;

public interface ProductCatalogService {

    List<ProductResponseDto> getPopularList(int limit);

    List<ProductResponseDto> getPriceDropList(int limit);

    List<ProductResponseDto> getFlashDealList();
}
