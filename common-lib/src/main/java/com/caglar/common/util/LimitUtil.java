package com.caglar.common.util;

/**
 * Sayısal parametreleri (limit, page size, vs.) sınırlamak için ortak yardımcı.
 * Stateless, statik fonksiyon — bean değil.
 */
public final class LimitUtil {

    private LimitUtil() {}

    /**
     * @param requested kullanıcıdan gelen değer
     * @param defaultValue {@code requested <= 0} ise dönecek varsayılan
     * @param max üst sınır (clamp tavanı)
     * @return geçerli aralığa sıkıştırılmış değer
     */
    public static int clamp(int requested, int defaultValue, int max) {
        return requested <= 0 ? defaultValue : Math.min(requested, max);
    }
}
