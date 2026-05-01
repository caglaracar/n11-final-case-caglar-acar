package com.caglar.product.controller;

import com.caglar.common.dto.BaseResponse;
import com.caglar.product.dto.request.CreateProductRequestDto;
import com.caglar.product.dto.request.UpdateProductRequestDto;
import com.caglar.product.dto.response.ProductResponseDto;
import com.caglar.product.dto.response.TrendingTermResponseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@Tag(name = "Product", description = "Ürün işlemleri")
public interface IProductApi {

    @Operation(summary = "Ürün oluştur (SELLER)")
    ResponseEntity<BaseResponse<ProductResponseDto>> create(@RequestHeader(value = "X-User-Id", required = false) Long sellerAuthId,
                                                            @Valid @RequestBody CreateProductRequestDto dto);

    @Operation(summary = "Ürün güncelle")
    ResponseEntity<BaseResponse<ProductResponseDto>> update(@PathVariable String id,
                                                            @Valid @RequestBody UpdateProductRequestDto dto);

    @Operation(summary = "Ürün sil")
    ResponseEntity<BaseResponse<Void>> remove(@PathVariable String id);

    @Operation(summary = "Ürün detay")
    ResponseEntity<BaseResponse<ProductResponseDto>> getById(@PathVariable String id);

    @Operation(summary = "Ürünleri listele (paginated)")
    ResponseEntity<BaseResponse<Page<ProductResponseDto>>> getList(@RequestParam(required = false) String q,
                                                                   @RequestParam(required = false) String categoryId,
                                                                   @RequestParam(required = false) String brandId,
                                                                   Pageable pageable);

    @Operation(summary = "En çok görüntülenen ürünler (top N)")
    ResponseEntity<BaseResponse<List<ProductResponseDto>>> getPopularList(@RequestParam(defaultValue = "5") int limit);

    @Operation(summary = "Fiyatı düşen ürünler")
    ResponseEntity<BaseResponse<List<ProductResponseDto>>> getPriceDropList(@RequestParam(defaultValue = "12") int limit);

    @Operation(summary = "Aktif flash deal ürünleri")
    ResponseEntity<BaseResponse<List<ProductResponseDto>>> getFlashDealList();

    @Operation(summary = "En çok aranan terimler (Redis ZSET)")
    ResponseEntity<BaseResponse<List<TrendingTermResponseDto>>> getTrendingTermList(
            @RequestParam(defaultValue = "10") int limit);
}
