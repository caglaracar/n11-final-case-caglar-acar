package com.caglar.order.entity;

import com.caglar.common.entity.BaseEntity;
import com.caglar.order.enums.OrderStatus;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "orders", indexes = {
        @Index(name = "idx_orders_auth", columnList = "auth_id"),
        @Index(name = "idx_orders_status", columnList = "status")
})
public class Order extends BaseEntity {

    @Column(name = "auth_id", nullable = false)
    private Long authId;

    @Column(name = "customer_email", length = 128)
    private String customerEmail;

    @Column(name = "customer_name", length = 128)
    private String customerName;

    @Column(name = "total_amount", nullable = false)
    private Double totalAmount;

    @Column(name = "currency", nullable = false, length = 8)
    private String currency;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 16)
    private OrderStatus status;

    /** Kargo adresi snapshot'ı (adres user-service'te değişebilir). */
    @Column(name = "shipping_address", length = 512)
    private String shippingAddress;

    @Column(name = "shipping_city", length = 64)
    private String shippingCity;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();

    public void addItem(OrderItem item) {
        items.add(item);
        item.setOrder(this);
    }
}
