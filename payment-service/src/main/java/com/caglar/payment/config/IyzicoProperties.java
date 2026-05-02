package com.caglar.payment.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * application.yml:
 * iyzico:
 *   api-key: sandbox-XXXX
 *   secret-key: sandbox-YYYY
 *   base-url: https://sandbox-api.iyzipay.com
 *   callback-url: http://localhost:9095/dev/v1/payment/iyzico/callback
 *   success-redirect: http://localhost:3000/orders/{orderId}/result
 *   failure-redirect: http://localhost:3000/orders/{orderId}/result
 */
@ConfigurationProperties(prefix = "iyzico")
public record IyzicoProperties(
        String apiKey,
        String secretKey,
        String baseUrl,
        String callbackUrl,
        String successRedirect,
        String failureRedirect
) {}
