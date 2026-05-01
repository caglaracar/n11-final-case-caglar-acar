package com.caglar.common.entity;

import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

/**
 * Tüm JPA entity'leri için ortak base.
 * - createdAt / updatedAt epoch-millis (long); dış dünyaya Instant (ISO-8601 / UTC) olarak çıkar.
 */
@Getter
@Setter
@MappedSuperclass
public abstract class BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false, nullable = false)
    private Long id;

    @Column(name = "created_at", updatable = false)
    private Long createdAt;

    @Column(name = "updated_at")
    private Long updatedAt;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now.toEpochMilli();
        this.updatedAt = now.toEpochMilli();
        if (this.isActive == null) {
            this.isActive = true;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now().toEpochMilli();
    }

    public Instant getCreatedAtUtc() {
        return createdAt == null ? null : Instant.ofEpochMilli(createdAt);
    }

    public Instant getUpdatedAtUtc() {
        return updatedAt == null ? null : Instant.ofEpochMilli(updatedAt);
    }
}
