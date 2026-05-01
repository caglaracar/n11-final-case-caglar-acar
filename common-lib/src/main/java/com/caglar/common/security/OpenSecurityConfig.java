package com.caglar.common.security;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

/**
 * User-context'i kullanmayan servisler (notification, payment) için açık Security config.
 *
 * <p>Aktivasyon: {@code app.security.mode=open}
 *
 * <p>Stateless + CSRF kapalı + tüm istekler permitAll. {@link HeaderAuthFilter}
 * eklenmez çünkü bu servisler kullanıcı kimliğine göre karar vermez (Kafka observer
 * veya provider entegrasyonu odaklı çalışırlar).
 */
@Configuration
@ConditionalOnProperty(name = "app.security.mode", havingValue = "open")
public class OpenSecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(c -> c.disable())
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(a -> a.anyRequest().permitAll());
        return http.build();
    }
}
