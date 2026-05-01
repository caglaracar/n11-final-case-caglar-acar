package com.caglar.common.security;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Gateway arkasındaki downstream servisler için ortak Security config.
 *
 * <p>Aktivasyon: {@code app.security.mode=downstream}
 *
 * <p>Davranış:
 * <ul>
 *   <li>Stateless oturum, CSRF kapalı.</li>
 *   <li>Tüm istekler {@link HeaderAuthFilter} ile {@code X-User-Id}/{@code X-User-Role}
 *       header'larından SecurityContext'e Authentication yerleştirir.</li>
 *   <li>{@code @EnableMethodSecurity} aktif → controller/method seviyesinde
 *       {@code @PreAuthorize("hasRole('ADMIN')")} kullanılabilir.</li>
 * </ul>
 *
 * Her endpoint {@code permitAll} olarak gelir; gerçek korumayı method-level annotation
 * sağlar (gateway zaten JWT'yi doğruladığı için duplicate validation yapılmaz).
 */
@Configuration
@EnableMethodSecurity
@ConditionalOnProperty(name = "app.security.mode", havingValue = "downstream")
public class DownstreamSecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, HeaderAuthFilter headerAuthFilter) throws Exception {
        http.csrf(c -> c.disable())
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(a -> a.anyRequest().permitAll())
            .addFilterBefore(headerAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
