package com.caglar.order.controller;

import com.caglar.common.dto.BaseResponse;
import com.caglar.order.dto.request.CreateOrderRequestDto;
import com.caglar.order.dto.response.OrderResponseDto;
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

@Tag(name = "Order", description = "Sipariş işlemleri")
public interface IOrderApi {

    @Operation(summary = "Sipariş oluştur (saga başlatır)")
    ResponseEntity<BaseResponse<OrderResponseDto>> create(@RequestHeader("X-User-Id") Long authId,
                                                          @Valid @RequestBody CreateOrderRequestDto dto);

    @Operation(summary = "Sipariş detay")
    ResponseEntity<BaseResponse<OrderResponseDto>> getById(@PathVariable Long id);

    @Operation(summary = "Kendi siparişlerim (paginated)")
    ResponseEntity<BaseResponse<Page<OrderResponseDto>>> getMyList(@RequestHeader("X-User-Id") Long authId,
                                                                  Pageable pageable);

    @Operation(summary = "Siparişi iptal et")
    ResponseEntity<BaseResponse<OrderResponseDto>> cancel(@PathVariable Long id);

    @Operation(summary = "Sipariş takibi — public, token gerekmez")
    ResponseEntity<BaseResponse<OrderResponseDto>> track(@RequestParam("orderId") Long orderId);

    @Operation(summary = "Müşteri teslim onayı — email linkinden çağrılır, public")
    ResponseEntity<BaseResponse<OrderResponseDto>> confirmDelivery(
            @RequestParam("orderId") Long orderId,
            @RequestParam("token") String token);
}
