package com.caglar.product.service;

import com.caglar.product.dto.request.ApplyPriceDropRequestDto;
import com.caglar.product.dto.request.SetFlashDealRequestDto;
import com.caglar.product.dto.response.ProductResponseDto;

public interface ProductCampaignService {

    ProductResponseDto setFlashDeal(String productId, SetFlashDealRequestDto dto);

    ProductResponseDto clearFlashDeal(String productId);

    ProductResponseDto applyPriceDrop(String productId, ApplyPriceDropRequestDto dto);

    ProductResponseDto clearPriceDrop(String productId);
}
