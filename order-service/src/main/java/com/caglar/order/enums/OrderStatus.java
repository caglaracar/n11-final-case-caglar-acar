package com.caglar.order.enums;

public enum OrderStatus {
    CREATED,
    PAYMENT_PENDING,
    PAID,
    FAILED,
    CANCELLED,
    SHIPPED,
    DELIVERED;

    /**
     * Çok basit bir state machine kuralı.
     */
    public boolean canTransitionTo(OrderStatus next) {
        return switch (this) {
            case CREATED        -> next == PAYMENT_PENDING || next == CANCELLED;
            case PAYMENT_PENDING -> next == PAID || next == FAILED || next == CANCELLED;
            case PAID            -> next == SHIPPED || next == CANCELLED;
            case SHIPPED         -> next == DELIVERED;
            case FAILED, CANCELLED, DELIVERED -> false;
        };
    }
}
