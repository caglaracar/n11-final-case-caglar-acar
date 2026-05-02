package com.caglar.payment.service;

import com.caglar.payment.dto.request.InitCheckoutRequestDto;

public interface IyzicoService {

    Result initialize(InitCheckoutRequestDto dto, String callbackUrl);

    Result retrieve(String token, Long orderId);

    record Result(
            boolean success,
            String paymentPageUrl,
            String token,
            String iyzicoPaymentId,
            String errorMessage
    ) {}
}
