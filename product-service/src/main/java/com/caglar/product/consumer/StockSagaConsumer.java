package com.caglar.product.consumer;

import com.caglar.common.constant.KafkaTopics;
import com.caglar.common.event.StockReserveFailedEvent;
import com.caglar.common.event.StockReserveRequestedEvent;
import com.caglar.product.entity.Product;
import com.caglar.product.repository.ProductRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Stok rezervasyon saga consumer.
 * order-service publish: stock.reserve.requested
 * - başarısızsa: stock.reserve.failed publish et
 * - başarılıysa: stok düşür
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class StockSagaConsumer {

    private final ProductRepository productRepository;
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = KafkaTopics.STOCK_RESERVE_REQUESTED, groupId = "product-service")
    public void onStockReserveRequested(String payload) {
        try {
            StockReserveRequestedEvent ev = objectMapper.readValue(payload, StockReserveRequestedEvent.class);
            log.info("Stock reserve requested: orderId={}, items={}", ev.orderId(), ev.items().size());

            // Her ürünü bir kez oku, hem validasyon hem güncelleme için kullan
            List<Product> toUpdate = new ArrayList<>();
            for (var item : ev.items()) {
                Product product = productRepository.findById(item.productId()).orElse(null);
                if (product == null || product.getStock() == null || product.getStock() < item.quantity()) {
                    publishFailed(ev.orderId(), "Yetersiz stok: " + item.productId());
                    return;
                }
                product.setStock(product.getStock() - item.quantity());
                toUpdate.add(product);
            }

            productRepository.saveAll(toUpdate);
            log.info("Stock reserved for orderId={}", ev.orderId());
        } catch (Exception e) {
            log.error("Stock reserve consume failed: {}", e.getMessage(), e);
        }
    }

    private void publishFailed(Long orderId, String reason) throws Exception {
        StockReserveFailedEvent ev = new StockReserveFailedEvent(orderId, reason);
        kafkaTemplate.send(KafkaTopics.STOCK_RESERVE_FAILED, String.valueOf(orderId),
                objectMapper.writeValueAsString(ev));
        log.warn("Stock reserve failed published: orderId={}, reason={}", orderId, reason);
    }
}
