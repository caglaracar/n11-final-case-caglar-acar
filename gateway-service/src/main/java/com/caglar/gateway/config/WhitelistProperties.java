package com.caglar.gateway.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.ArrayList;
import java.util.List;

@Configuration
@ConfigurationProperties(prefix = "gateway.security.whitelist")
@Data
public class WhitelistProperties {

    private List<String> paths = new ArrayList<>();
    private List<String> prefixes = new ArrayList<>();

    public boolean matches(String path) {
        if (paths.contains(path)) {
            return true;
        }
        for (String prefix : prefixes) {
            if (path.startsWith(prefix)) {
                return true;
            }
        }
        return false;
    }
}
