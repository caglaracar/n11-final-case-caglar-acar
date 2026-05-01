package com.caglar.product.controller;

import com.caglar.common.dto.BaseResponse;
import com.caglar.product.dto.request.CreateCategoryRequestDto;
import com.caglar.product.dto.request.UpdateCategoryRequestDto;
import com.caglar.product.dto.response.CategoryResponseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@Tag(name = "Category", description = "Kategori CRUD")
public interface ICategoryApi {

    @Operation(summary = "Kategori oluştur (ADMIN)")
    ResponseEntity<BaseResponse<CategoryResponseDto>> create(@Valid @RequestBody CreateCategoryRequestDto dto);

    @Operation(summary = "Kategori güncelle (ADMIN)")
    ResponseEntity<BaseResponse<CategoryResponseDto>> update(@PathVariable String id,
                                                             @Valid @RequestBody UpdateCategoryRequestDto dto);

    @Operation(summary = "Kategori sil (ADMIN — bağlı ürün yoksa)")
    ResponseEntity<BaseResponse<Void>> remove(@PathVariable String id);

    @Operation(summary = "Tüm kategorileri getir")
    ResponseEntity<BaseResponse<List<CategoryResponseDto>>> getList();
}
