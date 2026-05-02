package com.caglar.notification.consumer;

import com.caglar.common.constant.KafkaTopics;
import com.caglar.common.event.NotificationEmailEvent;
import com.caglar.common.event.NotificationSlackEvent;
import com.caglar.notification.sender.EmailSender;
import com.caglar.notification.sender.SlackSender;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class MailDispatchConsumer {

    private final EmailSender emailSender;
    private final SlackSender slackSender;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = KafkaTopics.NOTIFICATION_EMAIL, groupId = "notification-service")
    public void onEmail(String payload) {
        NotificationEmailEvent ev = parse(payload, NotificationEmailEvent.class, KafkaTopics.NOTIFICATION_EMAIL);
        if (ev != null) {
            emailSender.send(ev.to(), ev.subject(), ev.body());
        }
    }

    @KafkaListener(topics = KafkaTopics.NOTIFICATION_SLACK, groupId = "notification-service")
    public void onSlack(String payload) {
        NotificationSlackEvent ev = parse(payload, NotificationSlackEvent.class, KafkaTopics.NOTIFICATION_SLACK);
        if (ev != null) {
            slackSender.send(ev.channel(), ev.text());
        }
    }

    private <T> T parse(String payload, Class<T> type, String topic) {
        try {
            return objectMapper.readValue(payload, type);
        } catch (Exception e) {
            log.error("Failed to parse event topic={} payload={}", topic, payload, e);
            return null;
        }
    }
}
