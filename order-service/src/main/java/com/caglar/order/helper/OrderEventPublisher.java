package com.caglar.order.helper;

import com.caglar.common.constant.KafkaTopics;
import com.caglar.common.event.NotificationEmailEvent;
import com.caglar.common.event.OrderCreatedEvent;
import com.caglar.common.event.StockReserveRequestedEvent;
import com.caglar.order.config.OrderProperties;
import com.caglar.order.entity.Order;
import com.caglar.order.util.DeliveryTokenUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderEventPublisher {

    private static final String DELIVERY_EMAIL_BODY = """
            Merhaba,

            #%d numaralı siparişiniz kargoya verildi!

            Siparişinizi teslim aldığınızda aşağıdaki butona tıklayarak bize bildirin:
            %s

            Teşekkürler,
            n11 Bootcamp Ekibi
            """;

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;
    private final DeliveryTokenUtil deliveryTokenUtil;
    private final OrderProperties orderProperties;

    public void publishOrderCreated(Order o) {
        List<OrderCreatedEvent.OrderItem> items = o.getItems().stream()
                .map(i -> new OrderCreatedEvent.OrderItem(i.getProductId(), i.getProductName(),
                        i.getQuantity(), i.getUnitPrice()))
                .toList();
        OrderCreatedEvent ev = new OrderCreatedEvent(o.getId(), o.getAuthId(), items,
                o.getTotalAmount(), o.getCurrency(), Instant.now().toEpochMilli());
        sendOrThrow(KafkaTopics.ORDER_CREATED, o.getId(), ev,
                "Sipariş eventi gönderilemedi, işlem iptal edildi");
    }

    public void publishStockReserveRequested(Order o) {
        List<StockReserveRequestedEvent.Item> items = o.getItems().stream()
                .map(i -> new StockReserveRequestedEvent.Item(i.getProductId(), i.getQuantity()))
                .toList();
        StockReserveRequestedEvent ev = new StockReserveRequestedEvent(o.getId(), items);
        sendOrThrow(KafkaTopics.STOCK_RESERVE_REQUESTED, o.getId(), ev,
                "Stok rezervasyon eventi gönderilemedi, işlem iptal edildi");
    }

    public void publishDeliveryConfirmationEmail(Order o) {
        if (!StringUtils.hasText(o.getUserEmail())) {
            log.warn("Order {} has no userEmail; delivery confirmation email skipped", o.getId());
            return;
        }
        String token = deliveryTokenUtil.generate(o.getId());
        String confirmUrl = orderProperties.frontendUrl()
                + "/confirm-delivery?orderId=" + o.getId() + "&token=" + token;
        NotificationEmailEvent event = new NotificationEmailEvent(
                o.getUserEmail(),
                "Siparişiniz Kargoya Verildi — #" + o.getId(),
                DELIVERY_EMAIL_BODY.formatted(o.getId(), confirmUrl));
        sendOrLog(KafkaTopics.NOTIFICATION_EMAIL, o.getId(), event);
    }

    private void sendOrThrow(String topic, Long key, Object event, String errorMessage) {
        try {
            kafkaTemplate.send(topic, String.valueOf(key), objectMapper.writeValueAsString(event));
            log.info("{} published: orderId={}", topic, key);
        } catch (Exception e) {
            log.error("{} publish failed: orderId={}", topic, key, e);
            throw new RuntimeException(errorMessage, e);
        }
    }

    private void sendOrLog(String topic, Long key, Object event) {
        try {
            kafkaTemplate.send(topic, String.valueOf(key), objectMapper.writeValueAsString(event));
            log.info("{} published: orderId={}", topic, key);
        } catch (Exception e) {
            log.error("{} publish failed: orderId={}", topic, key, e);
        }
    }
}
