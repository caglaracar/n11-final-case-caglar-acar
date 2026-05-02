package com.caglar.order.consumer;

import com.caglar.common.constant.KafkaTopics;
import com.caglar.common.event.PaymentCompletedEvent;
import com.caglar.common.event.PaymentFailedEvent;
import com.caglar.order.service.OrderService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class PaymentResultConsumer {

    private final OrderService orderService;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = KafkaTopics.PAYMENT_COMPLETED, groupId = "order-service")
    public void onCompleted(String payload) {
        try {
            PaymentCompletedEvent ev = objectMapper.readValue(payload, PaymentCompletedEvent.class);
            log.info("Received payment.completed orderId={}", ev.orderId());
            orderService.onPaymentCompleted(ev.orderId());
        } catch (Exception e) {
            log.error("payment.completed handle failed: {}", e.getMessage(), e);
        }
    }

    @KafkaListener(topics = KafkaTopics.PAYMENT_FAILED, groupId = "order-service")
    public void onFailed(String payload) {
        try {
            PaymentFailedEvent ev = objectMapper.readValue(payload, PaymentFailedEvent.class);
            log.info("Received payment.failed orderId={} reason={}", ev.orderId(), ev.reason());
            orderService.onPaymentFailed(ev.orderId(), ev.reason());
        } catch (Exception e) {
            log.error("payment.failed handle failed: {}", e.getMessage(), e);
        }
    }
}
