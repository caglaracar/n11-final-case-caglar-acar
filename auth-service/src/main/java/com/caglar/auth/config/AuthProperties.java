package com.caglar.auth.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Auth-service runtime ayarları.
 *
 * <p>YAML:
 * <pre>
 * security:
 *   jwt:
 *     access-ttl-seconds: 900
 * app:
 *   admin:
 *     invite-code: n11-bootcamp-admin-2026
 * </pre>
 *
 * Not: bu class iki farklı prefix'i de bağlamak yerine prefix'siz kullanılır;
 * ilgili nested record'lar için her birinin kendi prefix'iyle ayrı bean'i bulunur.
 */
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
