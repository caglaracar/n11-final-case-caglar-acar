package com.caglar.payment.helper;

import com.caglar.common.constant.KafkaTopics;
import com.caglar.common.event.PaymentCompletedEvent;
import com.caglar.common.event.PaymentFailedEvent;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class PaymentEventPublisher {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    public void publishCompleted(PaymentCompletedEvent event) {
        send(KafkaTopics.PAYMENT_COMPLETED, String.valueOf(event.orderId()), event);
    }

    public void publishFailed(PaymentFailedEvent event) {
        send(KafkaTopics.PAYMENT_FAILED, String.valueOf(event.orderId()), event);
    }

    private void send(String topic, String key, Object payload) {
        try {
            kafkaTemplate.send(topic, key, objectMapper.writeValueAsString(payload));
            log.info("Kafka publish topic={} key={}", topic, key);
        } catch (JsonProcessingException e) {
            log.error("Kafka publish serialize failed topic={} key={}: {}", topic, key, e.getMessage());
        }
    }
}
