package com.caglar.order.consumer;

import com.caglar.common.constant.KafkaTopics;
import com.caglar.common.event.PaymentCompletedEvent;
import com.caglar.common.event.PaymentFailedEvent;
import com.caglar.common.event.StockReserveFailedEvent;
import com.caglar.order.enums.OrderStatus;
import com.caglar.order.repository.OrderRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Saga choreography consumer:
 * - payment.completed → status PAID
 * - payment.failed    → status FAILED
 * - stock.reserve.failed → status FAILED
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OrderSagaConsumer {

    private final OrderRepository orderRepository;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = KafkaTopics.PAYMENT_COMPLETED, groupId = "order-service")
    @Transactional
    public void onPaymentCompleted(String payload) {
        PaymentCompletedEvent ev = parse(payload, PaymentCompletedEvent.class, KafkaTopics.PAYMENT_COMPLETED);
        if (ev != null) {
            transition(ev.orderId(), OrderStatus.PAID);
        }
    }

    @KafkaListener(topics = KafkaTopics.PAYMENT_FAILED, groupId = "order-service")
    @Transactional
    public void onPaymentFailed(String payload) {
        PaymentFailedEvent ev = parse(payload, PaymentFailedEvent.class, KafkaTopics.PAYMENT_FAILED);
        if (ev != null) {
            transition(ev.orderId(), OrderStatus.FAILED);
        }
    }

    @KafkaListener(topics = KafkaTopics.STOCK_RESERVE_FAILED, groupId = "order-service")
    @Transactional
    public void onStockReserveFailed(String payload) {
        StockReserveFailedEvent ev = parse(payload, StockReserveFailedEvent.class, KafkaTopics.STOCK_RESERVE_FAILED);
        if (ev != null) {
            transition(ev.orderId(), OrderStatus.FAILED);
        }
    }

    private <T> T parse(String payload, Class<T> type, String topic) {
        try {
            return objectMapper.readValue(payload, type);
        } catch (Exception e) {
            // Poison message: log ve atla; sonsuz retry yapmasın.
            log.error("Failed to parse event from topic={} payload={}", topic, payload, e);
            return null;
        }
    }

    private void transition(Long orderId, OrderStatus next) {
        orderRepository.findById(orderId).ifPresentOrElse(order -> {
            if (order.getStatus().canTransitionTo(next)) {
                order.setStatus(next);
                orderRepository.save(order);
                log.info("Order {} -> {}", orderId, next);
            } else {
                log.warn("Order {} cannot transition {} -> {}", orderId, order.getStatus(), next);
            }
        }, () -> log.warn("Order {} not found while transitioning to {}", orderId, next));
    }
}
