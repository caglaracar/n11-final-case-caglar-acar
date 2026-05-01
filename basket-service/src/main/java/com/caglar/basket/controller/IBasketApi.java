package com.caglar.basket.controller;

import com.caglar.basket.dto.request.AddToBasketRequestDto;
import com.caglar.basket.dto.request.UpdateBasketItemRequestDto;
import com.caglar.basket.dto.response.BasketResponseDto;
import com.caglar.common.dto.BaseResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

@Tag(name = "Basket", description = "Sepet işlemleri (Redis)")
public interface IBasketApi {

    @Operation(summary = "Mevcut kullanıcının sepetini getir")
    ResponseEntity<BaseResponse<BasketResponseDto>> getMyBasket(@RequestHeader("X-User-Id") Long authId);

    @Operation(summary = "Sepete ürün ekle (varsa miktar artar)")
    ResponseEntity<BaseResponse<BasketResponseDto>> add(@RequestHeader("X-User-Id") Long authId,
                                                      @Valid @RequestBody AddToBasketRequestDto dto);

    @Operation(summary = "Sepetteki bir ürünü güncelle (qty=0 → çıkarılır)")
    ResponseEntity<BaseResponse<BasketResponseDto>> update(@RequestHeader("X-User-Id") Long authId,
                                                         @Valid @RequestBody UpdateBasketItemRequestDto dto);

    @Operation(summary = "Sepetten ürün çıkar")
    ResponseEntity<BaseResponse<BasketResponseDto>> remove(@RequestHeader("X-User-Id") Long authId,
                                                         String productId);

    @Operation(summary = "Sepeti temizle")
    ResponseEntity<BaseResponse<Void>> clear(@RequestHeader("X-User-Id") Long authId);
}
