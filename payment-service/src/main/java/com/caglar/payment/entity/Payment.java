package com.caglar.payment.entity;

import com.caglar.common.entity.BaseEntity;
import com.caglar.payment.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tbl_payment", indexes = {
        @Index(name = "ix_payment_order_id", columnList = "order_id", unique = true)
})
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Payment extends BaseEntity {

    @Column(name = "order_id", nullable = false, unique = true)
    private Long orderId;

    @Column(name = "auth_id", nullable = false)
    private Long authId;

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false, length = 8)
    private String currency;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private PaymentStatus status;

    @Column(name = "provider_ref", length = 64)
    private String providerRef;

    @Column(name = "fail_reason", length = 255)
    private String failReason;
}
