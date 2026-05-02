package com.caglar.payment.config;

import com.iyzipay.Options;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class IyzicoConfig {

    @Bean
    public Options iyzicoOptions(IyzicoProperties props) {
        Options options = new Options();
        options.setApiKey(props.apiKey());
        options.setSecretKey(props.secretKey());
        options.setBaseUrl(props.baseUrl());
        return options;
    }
}
