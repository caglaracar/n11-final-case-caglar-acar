package com.caglar.order.service.impl;

import com.caglar.common.exception.BusinessException;
import com.caglar.common.exception.ErrorType;
import com.caglar.common.util.Sorts;
import com.caglar.order.config.OrderProperties;
import com.caglar.order.dto.response.AdminStatsResponseDto;
import com.caglar.order.dto.response.OrderResponseDto;
import com.caglar.order.entity.Order;
import com.caglar.order.enums.OrderStatus;
import com.caglar.order.helper.OrderEventPublisher;
import com.caglar.order.mapper.AdminStatsMapper;
import com.caglar.order.mapper.OrderMapper;
import com.caglar.order.repository.OrderRepository;
import com.caglar.order.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminServiceImpl implements AdminService {

    private final OrderRepository orderRepository;
    private final OrderEventPublisher orderEventPublisher;
    private final OrderProperties orderProperties;

    @Override
    public AdminStatsResponseDto stats() {
        long total      = orderRepository.count();
        long pending    = orderRepository.countByStatus(OrderStatus.PAYMENT_PENDING)
                        + orderRepository.countByStatus(OrderStatus.CREATED);
        long paid       = orderRepository.countByStatus(OrderStatus.PAID);
        long cancelled  = orderRepository.countByStatus(OrderStatus.CANCELLED);
        Double rev      = orderRepository.sumRevenueByStatuses(List.of(OrderStatus.PAID));
        List<OrderResponseDto> recent = orderRepository.findAll(recentOrdersPage())
                .getContent().stream().map(OrderMapper::toResponse).toList();
        return AdminStatsMapper.toResponse(total, pending, paid, cancelled,
                rev == null ? 0.0 : rev,
                orderRepository.countByStatusGrouped(),
                orderRepository.revenueByMonth(),
                recent);
    }

    @Override
    public Page<OrderResponseDto> orders(OrderStatus status, Pageable pageable) {
        Page<Order> page = (status == null)
                ? orderRepository.findAll(pageable)
                : orderRepository.findByStatus(status, pageable);
        return page.map(OrderMapper::toResponse);
    }

    @Override
    @Transactional
    public OrderResponseDto updateStatus(Long orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException(ErrorType.NOT_FOUND, "Sipariş bulunamadı"));
        order.transitionTo(newStatus);
        Order saved = orderRepository.save(order);
        if (newStatus == OrderStatus.SHIPPED) {
            orderEventPublisher.publishDeliveryConfirmationEmail(saved);
        }
        return OrderMapper.toResponse(saved);
    }

    private Pageable recentOrdersPage() {
        return PageRequest.of(0, orderProperties.recentOrdersPageSize(), Sorts.CREATED_DESC);
    }
}
