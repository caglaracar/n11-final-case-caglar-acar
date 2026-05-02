package com.caglar.common.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.data.mongodb.core.MongoTemplate;

@Configuration
@EnableMongoAuditing
@ConditionalOnClass(MongoTemplate.class)
@ConditionalOnProperty(name = "app.mongo.auditing", havingValue = "true")
public class MongoAuditingConfig {
}
