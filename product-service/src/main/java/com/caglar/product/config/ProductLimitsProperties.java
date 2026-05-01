package com.caglar.product.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "product.limits")
public record ProductLimitsProperties(
        Bound popular,
        Bound priceDrop,
        Bound trending
) {

    public ProductLimitsProperties {
        if (popular == null) {
            popular    = new Bound(5, 10);
        }
        if (priceDrop == null) {
            priceDrop  = new Bound(12, 50);
        }
        if (trending == null) {
            trending   = new Bound(10, 50);
        }
    }

    public record Bound(int defaultValue, int max) {}
}
