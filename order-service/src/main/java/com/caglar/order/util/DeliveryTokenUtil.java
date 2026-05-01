package com.caglar.order.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

/**
 * Teslim onay token'ı üretir ve doğrular.
 * Algoritma: HmacSHA256(orderId, jwtSecret) → Base64URL (imzasız, DB gerektirmez).
 */
@Component
public class DeliveryTokenUtil {

    private final byte[] secretBytes;

    public DeliveryTokenUtil(@Value("${security.jwt.secret}") String secret) {
        this.secretBytes = secret.getBytes(StandardCharsets.UTF_8);
    }

    public String generate(Long orderId) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secretBytes, "HmacSHA256"));
            byte[] hash = mac.doFinal(String.valueOf(orderId).getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
        } catch (Exception e) {
            throw new RuntimeException("Delivery token oluşturulamadı", e);
        }
    }

    public boolean validate(Long orderId, String token) {
        if (token == null || token.isBlank()) {
            return false;
        }
        return token.equals(generate(orderId));
    }
}
