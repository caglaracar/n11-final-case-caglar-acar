package com.caglar.product.controller;

import com.caglar.common.dto.BaseResponse;
import com.caglar.product.dto.request.ApplyPriceDropRequestDto;
import com.caglar.product.dto.request.SetFlashDealRequestDto;
import com.caglar.product.dto.response.ProductResponseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

@Tag(name = "Product Campaign", description = "Flash deal ve fiyat indirimi yönetimi (ADMIN)")
public interface IProductCampaignApi {

    @Operation(summary = "Flash deal kampanyası başlat / uzat (ADMIN)")
    ResponseEntity<BaseResponse<ProductResponseDto>> setFlashDeal(@PathVariable String id,
                                                                  @Valid @RequestBody SetFlashDealRequestDto dto);

    @Operation(summary = "Flash deal kampanyasını sonlandır (ADMIN)")
    ResponseEntity<BaseResponse<ProductResponseDto>> clearFlashDeal(@PathVariable String id);

    @Operation(summary = "Fiyatı düşür (ADMIN). originalPrice yoksa mevcut fiyat referans alınır.")
    ResponseEntity<BaseResponse<ProductResponseDto>> applyPriceDrop(@PathVariable String id,
                                                                    @Valid @RequestBody ApplyPriceDropRequestDto dto);

    @Operation(summary = "İndirim göstergesini kaldır (ADMIN). price'a dokunulmaz.")
    ResponseEntity<BaseResponse<ProductResponseDto>> clearPriceDrop(@PathVariable String id);
}
