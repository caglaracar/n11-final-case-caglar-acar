package com.caglar.order.controller;

import com.caglar.common.dto.BaseResponse;
import com.caglar.order.dto.response.AdminStatsResponseDto;
import com.caglar.order.dto.response.OrderResponseDto;
import com.caglar.order.enums.OrderStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

@Tag(name = "Admin", description = "Admin paneli — sipariş yönetimi ve istatistik")
public interface IAdminApi {

    @Operation(summary = "Sipariş istatistikleri (dashboard)")
    ResponseEntity<BaseResponse<AdminStatsResponseDto>> stats();

    @Operation(summary = "Tüm siparişler (status filtresi opsiyonel)")
    ResponseEntity<BaseResponse<Page<OrderResponseDto>>> orders(
            @RequestParam(required = false) OrderStatus status, Pageable pageable);

    @Operation(summary = "Sipariş durumunu güncelle")
    ResponseEntity<BaseResponse<OrderResponseDto>> updateStatus(
            @PathVariable Long id, @RequestParam OrderStatus status);
}
