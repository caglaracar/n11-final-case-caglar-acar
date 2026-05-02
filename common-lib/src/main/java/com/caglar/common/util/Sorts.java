package com.caglar.common.util;

import org.springframework.data.domain.Sort;

public final class Sorts {

    private Sorts() {}

    public static final Sort CREATED_DESC = Sort.by(Sort.Order.desc("createdAt"));

    public static final Sort SORT_ORDER_THEN_NAME = Sort.by(
            Sort.Order.asc("sortOrder"),
            Sort.Order.asc("name"));

    public static final Sort SORT_ORDER_THEN_CREATED_DESC = Sort.by(
            Sort.Order.asc("sortOrder"),
            Sort.Order.desc("createdAt"));
}
