package com.caglar.payment.service;

import com.caglar.payment.dto.request.InitCheckoutRequestDto;
import com.caglar.payment.dto.response.InitCheckoutResponseDto;
import com.caglar.payment.dto.response.PaymentResponseDto;
import org.springframework.http.ResponseEntity;

public interface PaymentService {

    /** order-service Feign çağrısı: iyzico checkout init + DB insert. */
    InitCheckoutResponseDto initiate(InitCheckoutRequestDto dto);

    /** İyzico callback: token doğrula → DB güncelle → Kafka publish → 302 redirect. */
    ResponseEntity<Void> handleCallback(String token);

    /** Sipariş için en son ödeme kaydı (frontend result page için). */
    PaymentResponseDto getByOrderId(Long orderId);
}
