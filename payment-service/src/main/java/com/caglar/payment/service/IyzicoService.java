package com.caglar.payment.service;

import com.caglar.payment.dto.request.InitCheckoutRequestDto;

public interface IyzicoService {

    /** Checkout form initialize → iyzico ödeme sayfası URL + token döner. */
    Result initialize(InitCheckoutRequestDto dto, String callbackUrl);

    /** Token ile iyzico tarafına retrieve → ödeme durumu doğrulanır. */
    Result retrieve(String token, Long orderId);

    record Result(
            boolean success,
            String paymentPageUrl,
            String token,
            String iyzicoPaymentId,
            String errorMessage
    ) {}
}
