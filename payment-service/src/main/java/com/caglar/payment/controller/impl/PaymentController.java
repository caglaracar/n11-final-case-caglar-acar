package com.caglar.payment.controller.impl;

import com.caglar.common.controller.BaseController;
import com.caglar.common.dto.BaseResponse;
import com.caglar.payment.controller.IPaymentApi;
import com.caglar.payment.dto.request.InitCheckoutRequestDto;
import com.caglar.payment.dto.response.InitCheckoutResponseDto;
import com.caglar.payment.dto.response.PaymentResponseDto;
import com.caglar.payment.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import static com.caglar.common.constant.RestApis.PAYMENT;

@RestController
@RequestMapping(PAYMENT)
@RequiredArgsConstructor
public class PaymentController extends BaseController implements IPaymentApi {

    private final PaymentService paymentService;

    @Override
    @PostMapping("/init")
    public ResponseEntity<BaseResponse<InitCheckoutResponseDto>> initiate(
            @Valid @RequestBody InitCheckoutRequestDto dto) {
        return ok(paymentService.initiate(dto));
    }

    @Override
    @PostMapping("/iyzico/callback")
    public ResponseEntity<Void> callback(@RequestParam("token") String token) {
        return paymentService.handleCallback(token);
    }

    @Override
    @GetMapping("/order/{orderId}")
    public ResponseEntity<BaseResponse<PaymentResponseDto>> getByOrder(@PathVariable Long orderId) {
        return ok(paymentService.getByOrderId(orderId));
    }
}
