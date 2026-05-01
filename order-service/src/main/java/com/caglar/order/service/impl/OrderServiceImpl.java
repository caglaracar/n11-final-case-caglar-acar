package com.caglar.order.service.impl;

import com.caglar.common.exception.BusinessException;
import com.caglar.common.exception.ErrorType;
import com.caglar.order.dto.request.CreateOrderRequestDto;
import com.caglar.order.dto.response.OrderResponseDto;
import com.caglar.order.entity.Order;
import com.caglar.order.enums.OrderStatus;
import com.caglar.order.helper.OrderEventPublisher;
import com.caglar.order.mapper.OrderMapper;
import com.caglar.order.repository.OrderRepository;
import com.caglar.order.service.OrderService;
import com.caglar.order.util.DeliveryTokenUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderEventPublisher orderEventPublisher;
    private final DeliveryTokenUtil deliveryTokenUtil;

    @Override
    @Transactional
    public OrderResponseDto createOrder(Long authId, CreateOrderRequestDto dto) {
        if (authId == null) {
            throw new BusinessException(ErrorType.UNAUTHORIZED);
        }
        Order saved = orderRepository.save(OrderMapper.fromCreateRequest(authId, dto));
        orderEventPublisher.publishOrderCreated(saved);
        orderEventPublisher.publishStockReserveRequested(saved);
        return OrderMapper.toResponse(saved);
    }

    @Override
    public OrderResponseDto getById(Long id) {
        return OrderMapper.toResponse(requireOrder(id));
    }

    @Override
    public Page<OrderResponseDto> getMyList(Long authId, Pageable pageable) {
        return orderRepository.findByAuthId(authId, pageable).map(OrderMapper::toResponse);
    }

    @Override
    @Transactional
    public OrderResponseDto cancel(Long id) {
        Order order = requireOrder(id);
        order.transitionTo(OrderStatus.CANCELLED);
        return OrderMapper.toResponse(orderRepository.save(order));
    }

    @Override
    @Transactional
    public OrderResponseDto confirmDelivery(Long orderId, String token) {
        if (!deliveryTokenUtil.validate(orderId, token)) {
            throw new BusinessException(ErrorType.INVALID_TOKEN, "Geçersiz veya süresi dolmuş onay bağlantısı");
        }
        Order order = requireOrder(orderId);
        order.transitionTo(OrderStatus.DELIVERED);
        log.info("Order {} confirmed as DELIVERED by customer", orderId);
        return OrderMapper.toResponse(orderRepository.save(order));
    }

    private Order requireOrder(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorType.NOT_FOUND, "Sipariş bulunamadı"));
    }
}
