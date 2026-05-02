package com.caglar.product.stock;

public interface StockService {

    /**
     * Atomik olarak her kalem için {@code stock >= quantity} koşuluyla {@code stock} alanını düşürür.
     * Herhangi bir kalem için yetersiz stok varsa daha önce başarılı düşülenleri geri alır
     * ve {@link com.caglar.common.exception.BusinessException} fırlatır.
     */
    void reserve(StockOpRequestDto dto);

    /** Stoğu geri ekler (payment fail / order cancel). */
    void release(StockOpRequestDto dto);
}
