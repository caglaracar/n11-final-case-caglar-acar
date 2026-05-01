package com.caglar.payment.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "payment")
public record PaymentProperties(String provider) {

    public PaymentProperties {
        if (provider == null || provider.isBlank()) {
            provider = "mock";
        }
    }

    public boolean isIyzico() {
        return "iyzico".equalsIgnoreCase(provider);
    }
}
