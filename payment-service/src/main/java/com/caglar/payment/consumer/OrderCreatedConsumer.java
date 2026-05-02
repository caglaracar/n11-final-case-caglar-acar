package com.caglar.payment.consumer;

import com.caglar.common.constant.KafkaTopics;
import com.caglar.common.event.OrderCreatedEvent;
import com.caglar.payment.service.PaymentService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderCreatedConsumer {

    private final PaymentService paymentService;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = KafkaTopics.ORDER_CREATED, groupId = "payment-service")
    public void onOrderCreated(String payload) {
        try {
            OrderCreatedEvent ev = objectMapper.readValue(payload, OrderCreatedEvent.class);
            log.info("Received order.created: orderId={}", ev.orderId());
            paymentService.processOrder(ev);
        } catch (Exception e) {
            log.error("order.created consume failed: {}", e.getMessage(), e);
        }
    }
}
