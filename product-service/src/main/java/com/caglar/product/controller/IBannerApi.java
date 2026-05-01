package com.caglar.product.controller;

import com.caglar.common.dto.BaseResponse;
import com.caglar.product.dto.request.CreateBannerRequestDto;
import com.caglar.product.dto.request.UpdateBannerRequestDto;
import com.caglar.product.dto.response.BannerResponseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@Tag(name = "Banner", description = "Ana sayfa hero banner işlemleri")
public interface IBannerApi {

    @Operation(summary = "Aktif banner'lar — public")
    ResponseEntity<BaseResponse<List<BannerResponseDto>>> getActiveList();

    @Operation(summary = "Tüm banner'lar — ADMIN")
    ResponseEntity<BaseResponse<List<BannerResponseDto>>> getList();

    @Operation(summary = "Banner detay — ADMIN")
    ResponseEntity<BaseResponse<BannerResponseDto>> getById(@PathVariable String id);

    @Operation(summary = "Banner oluştur — ADMIN")
    ResponseEntity<BaseResponse<BannerResponseDto>> create(@Valid @RequestBody CreateBannerRequestDto dto);

    @Operation(summary = "Banner güncelle — ADMIN")
    ResponseEntity<BaseResponse<BannerResponseDto>> update(@PathVariable String id,
                                                           @Valid @RequestBody UpdateBannerRequestDto dto);

    @Operation(summary = "Banner sil — ADMIN")
    ResponseEntity<BaseResponse<Void>> remove(@PathVariable String id);
}
