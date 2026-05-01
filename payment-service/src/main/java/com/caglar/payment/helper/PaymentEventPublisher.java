package com.caglar.payment.helper;

import com.caglar.common.constant.KafkaTopics;
import com.caglar.common.event.PaymentCompletedEvent;
import com.caglar.common.event.PaymentFailedEvent;
import com.caglar.payment.entity.Payment;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Slf4j
@Component
@RequiredArgsConstructor
public class PaymentEventPublisher {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    public void publishCompleted(Payment p) {
        PaymentCompletedEvent ev = new PaymentCompletedEvent(
                p.getOrderId(), p.getAuthId(), p.getId(),
                p.getAmount() != null ? p.getAmount() : 0d,
                p.getCurrency(), p.getProviderRef(),
                Instant.now().toEpochMilli());
        sendOrLog(KafkaTopics.PAYMENT_COMPLETED, p.getOrderId(), ev);
    }

    public void publishFailed(Payment p) {
        PaymentFailedEvent ev = new PaymentFailedEvent(
                p.getOrderId(), p.getAuthId(), p.getId(),
                p.getFailReason(), Instant.now().toEpochMilli());
        sendOrLog(KafkaTopics.PAYMENT_FAILED, p.getOrderId(), ev);
    }

    private void sendOrLog(String topic, Long key, Object event) {
        try {
            kafkaTemplate.send(topic, String.valueOf(key), objectMapper.writeValueAsString(event));
            log.info("{} published orderId={}", topic, key);
        } catch (Exception e) {
            log.error("{} publish failed orderId={}", topic, key, e);
        }
    }
}
