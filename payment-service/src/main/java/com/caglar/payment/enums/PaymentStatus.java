package com.caglar.payment.enums;

public enum PaymentStatus {
    /** İyzico checkout form üretildi, kullanıcı ödeme sayfasına yönlendirildi. */
    INITIATED,
    /** Callback alındı, iyzico tarafında SUCCESS. */
    SUCCESS,
    /** Callback alındı, iyzico tarafında FAILURE veya doğrulama başarısız. */
    FAILED
}
