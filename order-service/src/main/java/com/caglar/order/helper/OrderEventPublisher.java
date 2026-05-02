package com.caglar.order.helper;

import com.caglar.common.constant.KafkaTopics;
import com.caglar.common.event.NotificationEmailEvent;
import com.caglar.common.event.OrderPlacedEvent;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderEventPublisher {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    public void publishOrderPlaced(OrderPlacedEvent event) {
        send(KafkaTopics.ORDER_PLACED, String.valueOf(event.orderId()), event);
        send(KafkaTopics.ORDER_EVENTS, String.valueOf(event.orderId()), event);
    }

    public void publishConfirmationEmail(String to, Long orderId, Double total, String currency) {
        if (to == null || to.isBlank()) return;
        String subject = "Siparişiniz alındı #" + orderId;
        String body = String.format(
                "Merhaba,%n%nSipariş #%d başarıyla alındı. Toplam: %.2f %s%n%n— n11",
                orderId, total, currency);
        send(KafkaTopics.NOTIFICATION_EMAIL, String.valueOf(orderId),
                new NotificationEmailEvent(to, subject, body));
    }

    private void send(String topic, String key, Object payload) {
        try {
            kafkaTemplate.send(topic, key, objectMapper.writeValueAsString(payload));
            log.info("Kafka publish topic={} key={}", topic, key);
        } catch (JsonProcessingException e) {
            log.error("Kafka publish serialize failed topic={}: {}", topic, e.getMessage());
        }
    }
}
