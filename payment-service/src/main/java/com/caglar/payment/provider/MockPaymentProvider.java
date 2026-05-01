package com.caglar.payment.provider;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

@Slf4j
@Component
@ConditionalOnProperty(name = "payment.provider", havingValue = "mock", matchIfMissing = true)
public class MockPaymentProvider implements PaymentProvider {

    @Value("${payment.mock.success-rate:1.0}")
    private double successRate;

    @Override
    public PaymentResult charge(Long orderId, Double amount, String currency, CardInfo card) {
        boolean success = ThreadLocalRandom.current().nextDouble() < successRate;
        if (success) {
            String ref = "mock-" + UUID.randomUUID().toString().substring(0, 8);
            log.info("Mock charge SUCCESS orderId={} amount={} {}", orderId, amount, currency);
            return PaymentResult.success(ref);
        }
        log.warn("Mock charge FAILED orderId={} amount={} {}", orderId, amount, currency);
        return PaymentResult.failure("Mock provider rejected the transaction");
    }
}
