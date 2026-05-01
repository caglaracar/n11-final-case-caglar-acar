package com.caglar.order.entity;

import com.caglar.common.entity.BaseEntity;
import com.caglar.common.exception.BusinessException;
import com.caglar.common.exception.ErrorType;
import com.caglar.order.enums.OrderStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tbl_order", indexes = @Index(name = "ix_order_auth_id", columnList = "auth_id"))
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Order extends BaseEntity {

    @Column(name = "auth_id", nullable = false)
    private Long authId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    @Builder.Default
    private OrderStatus status = OrderStatus.CREATED;

    @Column(nullable = false)
    private Double totalAmount;

    @Column(nullable = false, length = 8)
    @Builder.Default
    private String currency = "TRY";

    /** Kargo bildirimi için kullanılır. Sipariş oluşturulurken frontend'den alınır. */
    @Column(name = "user_email", length = 255)
    private String userEmail;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();

    /** Yeni kalem ekler ve totali günceller. */
    public void addItem(OrderItem item) {
        item.setOrder(this);
        items.add(item);
        this.totalAmount = (this.totalAmount == null ? 0d : this.totalAmount)
                + item.getQuantity() * item.getUnitPrice();
    }

    /** Status geçişini state-machine kurallarına göre uygular. */
    public void transitionTo(OrderStatus next) {
        if (!status.canTransitionTo(next)) {
            throw new BusinessException(ErrorType.INVALID_ARGUMENT,
                    "Geçersiz durum geçişi: " + status + " -> " + next);
        }
        this.status = next;
    }
}
