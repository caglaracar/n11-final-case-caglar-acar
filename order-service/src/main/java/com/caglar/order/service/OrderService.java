package com.caglar.order.service;

import com.caglar.order.dto.request.CheckoutRequestDto;
import com.caglar.order.dto.response.CheckoutResponseDto;
import com.caglar.order.dto.response.OrderResponseDto;

import java.util.List;

public interface OrderService {

    CheckoutResponseDto checkout(Long authId, CheckoutRequestDto dto);

    OrderResponseDto getById(Long authId, Long orderId);

    List<OrderResponseDto> getMyOrders(Long authId);

    OrderResponseDto cancel(Long authId, Long orderId);

    void onPaymentCompleted(Long orderId);

    void onPaymentFailed(Long orderId, String reason);
}
