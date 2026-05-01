package com.caglar.order.service;

import com.caglar.order.dto.response.AdminStatsResponseDto;
import com.caglar.order.dto.response.OrderResponseDto;
import com.caglar.order.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AdminService {
    AdminStatsResponseDto stats();
    Page<OrderResponseDto> orders(OrderStatus status, Pageable pageable);
    OrderResponseDto updateStatus(Long orderId, OrderStatus newStatus);
}
