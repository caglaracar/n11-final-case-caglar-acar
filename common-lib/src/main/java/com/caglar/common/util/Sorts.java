package com.caglar.common.util;

import org.springframework.data.domain.Sort;

/**
 * Domain-agnostic {@link Sort} presets used across services.
 * Sort instances are immutable, so these constants are safe to share.
 */
public final class Sorts {

    private Sorts() {}

    /** {@code createdAt DESC} — newest first. */
    public static final Sort CREATED_DESC = Sort.by(Sort.Order.desc("createdAt"));

    /** {@code sortOrder ASC, name ASC} — taxonomy ordering (categories, brands). */
    public static final Sort SORT_ORDER_THEN_NAME = Sort.by(
            Sort.Order.asc("sortOrder"),
            Sort.Order.asc("name"));

    /** {@code sortOrder ASC, createdAt DESC} — manually-ranked items, then newest. */
    public static final Sort SORT_ORDER_THEN_CREATED_DESC = Sort.by(
            Sort.Order.asc("sortOrder"),
            Sort.Order.desc("createdAt"));
}
