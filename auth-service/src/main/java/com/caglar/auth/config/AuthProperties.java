package com.caglar.auth.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

public final class AuthProperties {

    private AuthProperties() {}

    @ConfigurationProperties(prefix = "security.jwt")
    public record Jwt(long accessTtlSeconds) {
        public Jwt {
            if (accessTtlSeconds <= 0) {
                accessTtlSeconds = 900L;
            }
        }
    }

    @ConfigurationProperties(prefix = "app.admin")
    public record Admin(String inviteCode) {
        public boolean isEnabled() {
            return inviteCode != null && !inviteCode.isBlank();
        }
    }
}
