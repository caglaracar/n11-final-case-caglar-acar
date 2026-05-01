package com.caglar.product.controller;

import com.caglar.common.dto.BaseResponse;
import com.caglar.product.dto.request.CreateReviewRequestDto;
import com.caglar.product.dto.response.ReviewResponseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

@Tag(name = "Review", description = "Ürün yorumları")
public interface IReviewApi {

    @Operation(summary = "Yorum oluştur — giriş gerekli")
    ResponseEntity<BaseResponse<ReviewResponseDto>> create(
            @RequestHeader("X-User-Id") Long authId,
            @RequestHeader(value = "X-User-Name", required = false) String userName,
            @Valid @RequestBody CreateReviewRequestDto dto);

    @Operation(summary = "Bir ürünün yorumları — public")
    ResponseEntity<BaseResponse<Page<ReviewResponseDto>>> getByProductList(
            @PathVariable String productId, Pageable pageable);

    @Operation(summary = "Tüm yorumlar (moderasyon) — ADMIN")
    ResponseEntity<BaseResponse<Page<ReviewResponseDto>>> getList(Pageable pageable);

    @Operation(summary = "Yorum sil — ADMIN")
    ResponseEntity<BaseResponse<Void>> remove(@PathVariable String id);
}
