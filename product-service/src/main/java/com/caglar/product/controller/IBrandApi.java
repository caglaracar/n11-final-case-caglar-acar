package com.caglar.product.controller;

import com.caglar.common.dto.BaseResponse;
import com.caglar.product.dto.request.CreateBrandRequestDto;
import com.caglar.product.dto.request.UpdateBrandRequestDto;
import com.caglar.product.dto.response.BrandResponseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@Tag(name = "Brand", description = "Marka CRUD")
public interface IBrandApi {

    @Operation(summary = "Marka oluştur (ADMIN)")
    ResponseEntity<BaseResponse<BrandResponseDto>> create(@Valid @RequestBody CreateBrandRequestDto dto);

    @Operation(summary = "Marka güncelle (ADMIN)")
    ResponseEntity<BaseResponse<BrandResponseDto>> update(@PathVariable String id,
                                                          @Valid @RequestBody UpdateBrandRequestDto dto);

    @Operation(summary = "Marka sil (ADMIN — bağlı ürün yoksa)")
    ResponseEntity<BaseResponse<Void>> remove(@PathVariable String id);

    @Operation(summary = "Tüm markaları getir")
    ResponseEntity<BaseResponse<List<BrandResponseDto>>> getList();
}
