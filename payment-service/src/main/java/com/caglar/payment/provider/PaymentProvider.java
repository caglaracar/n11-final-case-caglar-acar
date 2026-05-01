package com.caglar.payment.provider;

/**
 * Strategy pattern: farklı sağlayıcılar (mock, İyzico) için ortak sözleşme.
 * Kart bilgisi burada alınır; asla DB veya Kafka'ya yazılmaz.
 */
public interface PaymentProvider {

    PaymentResult charge(Long orderId, Double amount, String currency, CardInfo card);

    record PaymentResult(boolean success, String providerRef, String failReason) {
        public static PaymentResult success(String ref) { return new PaymentResult(true, ref, null); }
        public static PaymentResult failure(String reason) { return new PaymentResult(false, null, reason); }
    }

    record CardInfo(
            String holderName,
            String cardNumber,
            String expireMonth,
            String expireYear,
            String cvc
    ) {}
}
