package com.caglar.common.config;

import com.mongodb.MongoClientSettings;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.mongo.MongoClientSettingsBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

@Configuration
@ConditionalOnClass(MongoClientSettings.class)
public class MongoConnectionConfig {

    @Bean
    public MongoClientSettingsBuilderCustomizer mongoConnectionSettings() {
        return builder -> builder
                .applyToSocketSettings(s -> s
                        .connectTimeout(5, TimeUnit.SECONDS)
                        .readTimeout(5, TimeUnit.SECONDS))
                .applyToClusterSettings(s -> s
                        .serverSelectionTimeout(5, TimeUnit.SECONDS))
                .applyToConnectionPoolSettings(s -> s
                        .maxConnectionIdleTime(10, TimeUnit.MINUTES)
                        .maintenanceInitialDelay(1, TimeUnit.MINUTES)
                        .maintenanceFrequency(1, TimeUnit.MINUTES));
    }
}
