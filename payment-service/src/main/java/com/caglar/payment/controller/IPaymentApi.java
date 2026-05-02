package com.caglar.payment.controller;

import com.caglar.common.dto.BaseResponse;
import com.caglar.payment.dto.request.InitCheckoutRequestDto;
import com.caglar.payment.dto.response.InitCheckoutResponseDto;
import com.caglar.payment.dto.response.PaymentResponseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

@Tag(name = "Payment", description = "İyzico ödeme akışı")
public interface IPaymentApi {

    @Operation(summary = "Order-service tarafından çağrılır: iyzico checkout init")
    ResponseEntity<BaseResponse<InitCheckoutResponseDto>> initiate(@Valid @RequestBody InitCheckoutRequestDto dto);

    @Operation(summary = "İyzico callback (public). Token ile durum doğrulanır → Kafka publish + redirect")
    ResponseEntity<Void> callback(@RequestParam("token") String token);

    @Operation(summary = "Sipariş için son ödeme kaydı")
    ResponseEntity<BaseResponse<PaymentResponseDto>> getByOrder(@PathVariable Long orderId);
}
