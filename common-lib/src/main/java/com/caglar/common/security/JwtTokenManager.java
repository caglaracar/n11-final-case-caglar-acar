package com.caglar.common.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Component
public class JwtTokenManager {

    private final SecretKey key;
    private final long accessTtlSeconds;
    private final long refreshTtlSeconds;
    private final String issuer;

    public JwtTokenManager(@Value("${security.jwt.secret:change-me-please-change-me-please-change-me}") String secret,
                           @Value("${security.jwt.access-ttl-seconds:900}") long accessTtlSeconds,
                           @Value("${security.jwt.refresh-ttl-seconds:1209600}") long refreshTtlSeconds,
                           @Value("${security.jwt.issuer:n11-bootcamp}") String issuer) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessTtlSeconds = accessTtlSeconds;
        this.refreshTtlSeconds = refreshTtlSeconds;
        this.issuer = issuer;
    }

    public String createAccessToken(Long authId, String role) {
        Instant now = Instant.now();
        return Jwts.builder()
                .issuer(issuer)
                .subject(String.valueOf(authId))
                .claim("role", role)
                .claim("typ", "access")
                .id(UUID.randomUUID().toString())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(accessTtlSeconds)))
                .signWith(key)
                .compact();
    }

    public RefreshToken createRefreshToken(Long authId, String role) {
        Instant now = Instant.now();
        Instant expiresAt = now.plusSeconds(refreshTtlSeconds);
        String jti = UUID.randomUUID().toString();
        String token = Jwts.builder()
                .issuer(issuer)
                .subject(String.valueOf(authId))
                .claim("role", role)
                .claim("typ", "refresh")
                .id(jti)
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiresAt))
                .signWith(key)
                .compact();
        return new RefreshToken(token, jti, expiresAt.toEpochMilli());
    }

    public Optional<Claims> parse(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            return Optional.of(claims);
        } catch (Exception e) {
            log.debug("JWT parse failed: {}", e.getMessage());
            return Optional.empty();
        }
    }

    public Optional<String> extractJti(String token) {
        return parse(token).map(Claims::getId);
    }

    public record RefreshToken(String token, String jti, long expiresAt) {}
}
