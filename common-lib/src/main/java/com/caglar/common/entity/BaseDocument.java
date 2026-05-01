package com.caglar.common.entity;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;

import java.time.Instant;

/**
 * MongoDB doküman'ları için ortak base. Auditing (@EnableMongoAuditing)
 * her servisin kendi config'inde aktive edilir.
 *
 * createdAt/updatedAt epoch-millis olarak depolanır; dış dünyaya Instant (ISO-8601 / UTC) olarak çıkar.
 */
@Getter
@Setter
public abstract class BaseDocument {

    @Id
    private String id;

    @CreatedDate
    private Long createdAt;

    @LastModifiedDate
    private Long updatedAt;

    private Boolean isActive = true;

    public Instant getCreatedAtUtc() {
        return createdAt == null ? null : Instant.ofEpochMilli(createdAt);
    }

    public Instant getUpdatedAtUtc() {
        return updatedAt == null ? null : Instant.ofEpochMilli(updatedAt);
    }
}
