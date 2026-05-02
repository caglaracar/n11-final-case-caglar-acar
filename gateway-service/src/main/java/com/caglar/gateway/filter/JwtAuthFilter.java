package com.caglar.gateway.filter;

import com.caglar.gateway.config.WhitelistProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

@Slf4j
@Component
public class JwtAuthFilter implements GlobalFilter, Ordered {

    private static final String BEARER_PREFIX = "Bearer ";
    private static final String TOKEN_TYPE_ACCESS = "access";

    private final SecretKey key;
    private final WhitelistProperties whitelist;

    public JwtAuthFilter(@Value("${security.jwt.secret}") String secret, WhitelistProperties whitelist) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.whitelist = whitelist;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = stripUserHeaders(exchange.getRequest());
        if (whitelist.matches(request.getURI().getPath())) {
            return chain.filter(exchange.mutate().request(request).build());
        }

        String token = extractBearerToken(request);
        if (token == null) {
            return unauthorized(exchange, "Authorization header missing");
        }

        try {
            Claims claims = parseClaims(token);
            return chain.filter(exchange.mutate().request(injectUserHeaders(request, claims)).build());
        } catch (TokenTypeException e) {
            return unauthorized(exchange, e.getMessage());
        } catch (Exception e) {
            log.debug("JWT validation failed: {}", e.getMessage());
            return unauthorized(exchange, "Invalid token");
        }
    }

    private ServerHttpRequest stripUserHeaders(ServerHttpRequest request) {
        return request.mutate().headers(h -> {
            h.remove("X-User-Id");
            h.remove("X-User-Role");
        }).build();
    }

    private String extractBearerToken(ServerHttpRequest request) {
        String header = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        return (header != null && header.startsWith(BEARER_PREFIX)) ? header.substring(BEARER_PREFIX.length()) : null;
    }

    private Claims parseClaims(String token) {
        Claims claims = Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
        if (!TOKEN_TYPE_ACCESS.equals(claims.get("typ", String.class))) {
            throw new TokenTypeException("Invalid token type");
        }
        return claims;
    }

    private ServerHttpRequest injectUserHeaders(ServerHttpRequest request, Claims claims) {
        return request.mutate()
                .header("X-User-Id", claims.getSubject())
                .header("X-User-Role", String.valueOf(claims.get("role", String.class)))
                .build();
    }

    private Mono<Void> unauthorized(ServerWebExchange exchange, String reason) {
        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        exchange.getResponse().getHeaders().add("X-Auth-Error", reason);
        exchange.getResponse().getHeaders().add("Content-Type", "application/json");
        byte[] body = ("{\"result\":false,\"errorMessage\":\"" + reason + "\",\"data\":null}")
                .getBytes(StandardCharsets.UTF_8);
        DataBuffer buffer = exchange.getResponse().bufferFactory().wrap(body);
        return exchange.getResponse().writeWith(Mono.just(buffer));
    }

    @Override
    public int getOrder() {
        return -1;
    }

    private static final class TokenTypeException extends RuntimeException {
        TokenTypeException(String msg) { super(msg); }
    }
}
