package com.caglar.order.enums;

public enum OrderStatus {
    /** Sipariş oluşturuldu, ödeme bekliyor (iyzico checkout açıldı). */
    PENDING,
    /** Ödeme tamamlandı. */
    PAID,
    /** Kargolandı. */
    SHIPPED,
    /** Teslim edildi. */
    DELIVERED,
    /** Kullanıcı iptal etti (sadece PENDING'den geçiş yapılabilir). */
    CANCELLED,
    /** Ödeme başarısız oldu (payment.failed eventi). */
    FAILED
}
