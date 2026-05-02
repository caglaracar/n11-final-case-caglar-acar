package com.caglar.common.util;

public final class LimitUtil {

    private LimitUtil() {}

    public static int clamp(int requested, int defaultValue, int max) {
        return requested <= 0 ? defaultValue : Math.min(requested, max);
    }
}
