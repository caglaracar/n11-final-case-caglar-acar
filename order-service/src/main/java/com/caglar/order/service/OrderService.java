package com.caglar.order.service;

import com.caglar.order.dto.request.CreateOrderRequestDto;
import com.caglar.order.dto.response.OrderResponseDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface OrderService {

    OrderResponseDto createOrder(Long authId, CreateOrderRequestDto dto);

    OrderResponseDto getById(Long id);

    Page<OrderResponseDto> getMyList(Long authId, Pageable pageable);

    OrderResponseDto cancel(Long id);

    /** Teslim onayı: token doğrulanır, SHIPPED → DELIVERED geçişi yapılır. Public endpoint. */
    OrderResponseDto confirmDelivery(Long orderId, String token);
}
