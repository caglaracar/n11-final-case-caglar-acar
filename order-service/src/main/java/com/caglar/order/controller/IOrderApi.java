package com.caglar.order.controller;

import com.caglar.common.dto.BaseResponse;
import com.caglar.order.dto.request.CheckoutRequestDto;
import com.caglar.order.dto.response.CheckoutResponseDto;
import com.caglar.order.dto.response.OrderResponseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.List;

@Tag(name = "Order", description = "Sipariş yönetimi")
public interface IOrderApi {

    @Operation(summary = "Sepetten sipariş oluştur ve İyzico ödeme sayfası URL'i döndür")
    ResponseEntity<BaseResponse<CheckoutResponseDto>> checkout(
            @RequestHeader("X-User-Id") Long authId,
            @Valid @RequestBody CheckoutRequestDto dto);

    @Operation(summary = "Kullanıcının siparişleri")
    ResponseEntity<BaseResponse<List<OrderResponseDto>>> myOrders(
            @RequestHeader("X-User-Id") Long authId);

    @Operation(summary = "Sipariş detayı")
    ResponseEntity<BaseResponse<OrderResponseDto>> getById(
            @RequestHeader("X-User-Id") Long authId,
            @PathVariable Long id);

    @Operation(summary = "Siparişi iptal et (sadece PENDING)")
    ResponseEntity<BaseResponse<OrderResponseDto>> cancel(
            @RequestHeader("X-User-Id") Long authId,
            @PathVariable Long id);
}
