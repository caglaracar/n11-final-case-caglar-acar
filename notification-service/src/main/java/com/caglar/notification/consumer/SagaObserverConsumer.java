package com.caglar.notification.consumer;

import com.caglar.common.constant.KafkaTopics;
import com.caglar.common.dto.BaseResponse;
import com.caglar.common.event.OrderCreatedEvent;
import com.caglar.common.event.PaymentCompletedEvent;
import com.caglar.common.event.PaymentFailedEvent;
import com.caglar.notification.dto.response.AuthInfoResponseDto;
import com.caglar.notification.helper.OrderConfirmationMailFactory;
import com.caglar.notification.client.AuthServiceClient;
import com.caglar.notification.sender.EmailSender;
import com.caglar.notification.sender.SlackSender;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

/**
 * Saga gözlemcisi:
 * Order/Payment eventlerini dinler; Slack'e bildirim atar, başarılı ödemede
 * kullanıcıya sipariş onay maili gönderir. Domain state'ini değiştirmez.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class SagaObserverConsumer {

    private static final String ORDERS_CHANNEL = "#orders";

    private final EmailSender emailSender;
    private final SlackSender slackSender;
    private final ObjectMapper objectMapper;
    private final AuthServiceClient authServiceClient;
    private final OrderConfirmationMailFactory orderConfirmationMailFactory;

    @KafkaListener(topics = KafkaTopics.ORDER_CREATED, groupId = "notification-observer")
    public void onOrderCreated(String payload) {
        OrderCreatedEvent ev = parse(payload, OrderCreatedEvent.class, KafkaTopics.ORDER_CREATED);
        if (ev != null) {
            slackSender.send(ORDERS_CHANNEL,
                    "🛒 Yeni sipariş: orderId=" + ev.orderId() + ", tutar=" + ev.totalAmount());
        }
    }

    @KafkaListener(topics = KafkaTopics.PAYMENT_COMPLETED, groupId = "notification-observer")
    public void onPaymentCompleted(String payload) {
        PaymentCompletedEvent ev = parse(payload, PaymentCompletedEvent.class, KafkaTopics.PAYMENT_COMPLETED);
        if (ev == null) {
            return;
        }
        slackSender.send(ORDERS_CHANNEL, "✅ Ödeme tamamlandı: orderId=" + ev.orderId());
        sendOrderConfirmationMail(ev);
    }

    @KafkaListener(topics = KafkaTopics.PAYMENT_FAILED, groupId = "notification-observer")
    public void onPaymentFailed(String payload) {
        PaymentFailedEvent ev = parse(payload, PaymentFailedEvent.class, KafkaTopics.PAYMENT_FAILED);
        if (ev != null) {
            slackSender.send(ORDERS_CHANNEL,
                    "❌ Ödeme başarısız: orderId=" + ev.orderId() + " sebep=" + ev.reason());
        }
    }

    private void sendOrderConfirmationMail(PaymentCompletedEvent ev) {
        if (ev.authId() == null) {
            log.warn("PaymentCompleted event'inde authId null, mail gönderilemiyor orderId={}", ev.orderId());
            return;
        }
        AuthInfoResponseDto info = lookupAuthInfo(ev.authId());
        if (info == null || info.email() == null || info.email().isBlank()) {
            log.warn("authId={} için email bulunamadı, mail atlanıyor", ev.authId());
            return;
        }
        emailSender.send(orderConfirmationMailFactory.build(info.email(), info.userName(), ev));
    }

    private AuthInfoResponseDto lookupAuthInfo(Long authId) {
        try {
            ResponseEntity<BaseResponse<AuthInfoResponseDto>> resp = authServiceClient.getByAuthId(authId);
            return resp.getBody() != null ? resp.getBody().data() : null;
        } catch (Exception e) {
            log.warn("authId={} lookup failed: {}", authId, e.getMessage());
            return null;
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
