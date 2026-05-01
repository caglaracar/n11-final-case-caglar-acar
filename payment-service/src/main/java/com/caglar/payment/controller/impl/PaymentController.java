package com.caglar.payment.controller.impl;

import com.caglar.common.controller.BaseController;
import com.caglar.common.dto.BaseResponse;
import com.caglar.payment.controller.IPaymentApi;
import com.caglar.payment.dto.request.CheckoutRequestDto;
import com.caglar.payment.dto.response.PaymentResponseDto;
import com.caglar.payment.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static com.caglar.common.constant.RestApis.PAYMENT;

@RestController
@RequestMapping(PAYMENT)
@RequiredArgsConstructor
public class PaymentController extends BaseController implements IPaymentApi {

    private final PaymentService paymentService;

    @Override
    @PostMapping("/checkout")
    public ResponseEntity<BaseResponse<PaymentResponseDto>> checkout(
            @RequestHeader("X-User-Id") Long authId,
            @Valid @RequestBody CheckoutRequestDto dto) {
        return ok(paymentService.checkout(authId, dto));
    }
}
