package com.caglar.order.repository;

import com.caglar.common.repository.BaseRepository;
import com.caglar.order.entity.Order;

import java.util.List;

public interface OrderRepository extends BaseRepository<Order, Long> {

    List<Order> findByAuthIdOrderByIdDesc(Long authId);
}
