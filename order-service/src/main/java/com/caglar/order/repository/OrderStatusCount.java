package com.caglar.order.repository;

import com.caglar.order.enums.OrderStatus;

public interface OrderStatusCount {
    OrderStatus getStatus();
    long getCount();
}
