package com.caglar.order.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "order")
public record OrderProperties(
        String frontendUrl,
        int recentOrdersPageSize
) {

    public OrderProperties {
        if (frontendUrl == null || frontendUrl.isBlank()) {
            frontendUrl = "http://localhost:3000";
        }
        if (recentOrdersPageSize <= 0) {
            recentOrdersPageSize = 10;
        }
    }
}
