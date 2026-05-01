package com.caglar.payment.controller;

import com.caglar.common.dto.BaseResponse;
import com.caglar.payment.dto.request.CheckoutRequestDto;
import com.caglar.payment.dto.response.PaymentResponseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

@Tag(name = "Payment", description = "Ödeme işlemleri")
public interface IPaymentApi {

    @Operation(summary = "Kart bilgisiyle checkout — İyzico veya mock provider")
    ResponseEntity<BaseResponse<PaymentResponseDto>> checkout(
            @RequestHeader("X-User-Id") Long authId,
            @Valid @RequestBody CheckoutRequestDto dto);
}
