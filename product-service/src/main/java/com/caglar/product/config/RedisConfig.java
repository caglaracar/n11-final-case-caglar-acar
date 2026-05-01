package com.caglar.product.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.StringRedisTemplate;

/**
 * Search popularity tracking için sade String tabanlı Redis bean'i.
 *
 * Saklanan veri yalnızca sayılar (ZINCRBY skorları), karmaşık nesne yok →
 * StringRedisTemplate yeterli. ObjectMapper'a ihtiyaç duymadan çalışır.
 */
@Configuration
public class RedisConfig {

    @Bean
    public StringRedisTemplate stringRedisTemplate(RedisConnectionFactory cf) {
        return new StringRedisTemplate(cf);
    }
}
