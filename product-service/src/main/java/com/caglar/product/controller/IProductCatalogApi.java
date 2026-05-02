package com.caglar.product.controller;

import com.caglar.common.dto.BaseResponse;
import com.caglar.product.dto.response.ProductResponseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@Tag(name = "Product Catalog", description = "Vitrin / kampanya listeleri")
public interface IProductCatalogApi {

    @Operation(summary = "En çok görüntülenen ürünler (top N)")
    ResponseEntity<BaseResponse<List<ProductResponseDto>>> getPopularList(@RequestParam(defaultValue = "5") int limit);

    @Operation(summary = "Fiyatı düşen ürünler")
    ResponseEntity<BaseResponse<List<ProductResponseDto>>> getPriceDropList(@RequestParam(defaultValue = "12") int limit);

    @Operation(summary = "Aktif flash deal ürünleri")
    ResponseEntity<BaseResponse<List<ProductResponseDto>>> getFlashDealList();
}
