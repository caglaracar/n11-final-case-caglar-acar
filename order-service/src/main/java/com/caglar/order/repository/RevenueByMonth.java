package com.caglar.order.repository;

public interface RevenueByMonth {
    Integer getYear();
    Integer getMonth();
    Double getTotal();
    Long getOrders();
}
