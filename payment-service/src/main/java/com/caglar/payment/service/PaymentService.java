package com.caglar.payment.service;

import com.caglar.payment.dto.request.InitCheckoutRequestDto;
import com.caglar.payment.dto.response.InitCheckoutResponseDto;
import com.caglar.payment.dto.response.PaymentResponseDto;
import org.springframework.http.ResponseEntity;

public interface PaymentService {

    InitCheckoutResponseDto initiate(InitCheckoutRequestDto dto);

    ResponseEntity<Void> handleCallback(String token);

    PaymentResponseDto getByOrderId(Long orderId);
}
