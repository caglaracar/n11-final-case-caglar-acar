package com.caglar.payment.service;

import com.caglar.common.event.OrderCreatedEvent;
import com.caglar.payment.dto.request.CheckoutRequestDto;
import com.caglar.payment.dto.response.PaymentResponseDto;
import com.caglar.payment.entity.Payment;

public interface PaymentService {

    /** Saga consumer tetikler (mock auto-payment). */
    Payment processOrder(OrderCreatedEvent event);

    /** Frontend'den direkt kart ile çağrılır — İyzico veya mock için. */
    PaymentResponseDto checkout(Long authId, CheckoutRequestDto dto);
}
