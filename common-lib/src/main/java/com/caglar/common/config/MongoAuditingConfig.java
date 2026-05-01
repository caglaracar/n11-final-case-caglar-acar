package com.caglar.common.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.data.mongodb.core.MongoTemplate;

/**
 * Mongo tabanlı servisler (product, user) için ortak auditing config.
 *
 * <p>Aktivasyon: classpath'te Mongo varsa (yani servis Mongo'yu exclude etmemişse) ve
 * {@code app.mongo.auditing=true} property'si set edilmişse. {@link com.caglar.common.document.BaseDocument}
 * @CreatedDate / @LastModifiedDate alanlarının otomatik doldurulması için gereklidir.
 */
@Configuration
@EnableMongoAuditing
@ConditionalOnClass(MongoTemplate.class)
@ConditionalOnProperty(name = "app.mongo.auditing", havingValue = "true")
public class MongoAuditingConfig {
}
