package com.caglar.product.controller.impl;

import com.caglar.common.controller.BaseController;
import com.caglar.common.dto.BaseResponse;
import com.caglar.product.controller.IProductCampaignApi;
import com.caglar.product.dto.request.ApplyPriceDropRequestDto;
import com.caglar.product.dto.request.SetFlashDealRequestDto;
import com.caglar.product.dto.response.ProductResponseDto;
import com.caglar.product.service.ProductCampaignService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static com.caglar.common.constant.RestApis.PRODUCT;

@RestController
@RequestMapping(PRODUCT)
@RequiredArgsConstructor
public class ProductCampaignController extends BaseController implements IProductCampaignApi {

    private final ProductCampaignService productCampaignService;

    @Override
    @PutMapping("/{id}/flash-deal")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BaseResponse<ProductResponseDto>> setFlashDeal(@PathVariable String id,
                                                                         @Valid @RequestBody SetFlashDealRequestDto dto) {
        return ok(productCampaignService.setFlashDeal(id, dto));
    }

    @Override
    @DeleteMapping("/{id}/flash-deal")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BaseResponse<ProductResponseDto>> clearFlashDeal(@PathVariable String id) {
        return ok(productCampaignService.clearFlashDeal(id));
    }

    @Override
    @PutMapping("/{id}/price-drop")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BaseResponse<ProductResponseDto>> applyPriceDrop(@PathVariable String id,
                                                                           @Valid @RequestBody ApplyPriceDropRequestDto dto) {
        return ok(productCampaignService.applyPriceDrop(id, dto));
    }

    @Override
    @DeleteMapping("/{id}/price-drop")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BaseResponse<ProductResponseDto>> clearPriceDrop(@PathVariable String id) {
        return ok(productCampaignService.clearPriceDrop(id));
    }
}
