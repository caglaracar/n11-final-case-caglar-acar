package com.caglar.auth.entity;

import com.caglar.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "tbl_refresh_token", indexes = {
        @Index(name = "ix_refresh_jti", columnList = "jti", unique = true),
        @Index(name = "ix_refresh_auth_id", columnList = "auth_id")
})
public class RefreshToken extends BaseEntity {

    @Column(name = "jti", nullable = false, unique = true, length = 64)
    private String jti;

    @Column(name = "auth_id", nullable = false)
    private Long authId;

    @Column(name = "expires_at", nullable = false)
    private Long expiresAt;

    @Column(name = "revoked", nullable = false)
    @Builder.Default
    private Boolean revoked = false;
}
