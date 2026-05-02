package com.caglar.notification.consumer;

import com.caglar.common.constant.KafkaTopics;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class OrderEventsConsumer {

    @KafkaListener(topics = KafkaTopics.ORDER_EVENTS, groupId = "notification-service")
    public void onOrderEvent(String payload) {
        log.info("order-events received: {}", payload);
    }
}
