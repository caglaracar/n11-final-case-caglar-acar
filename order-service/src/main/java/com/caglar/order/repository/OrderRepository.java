package com.caglar.order.repository;

import com.caglar.common.repository.BaseRepository;
import com.caglar.order.entity.Order;
import com.caglar.order.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface OrderRepository extends BaseRepository<Order, Long> {

    List<Order> findByAuthIdOrderByIdDesc(Long authId);

    List<Order> findByAuthIdAndStatus(Long authId, OrderStatus status);

    Page<Order> findAllByOrderByIdDesc(Pageable pageable);

    Page<Order> findAllByStatusOrderByIdDesc(OrderStatus status, Pageable pageable);
}
