package com.caglar.notification.service.impl;

import com.caglar.notification.config.NotificationProperties;
import com.caglar.notification.dto.request.OrderConfirmedRequestDto;
import com.caglar.notification.sender.EmailSender;
import com.caglar.notification.sender.SlackSender;
import com.caglar.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final EmailSender emailSender;
    private final SlackSender slackSender;
    private final NotificationProperties properties;

    @Override
    public void sendOrderConfirmed(OrderConfirmedRequestDto dto) {
        sendEmail(dto);
        sendSlack(dto);
    }

    private void sendEmail(OrderConfirmedRequestDto dto) {
        if (dto.customerEmail() == null || dto.customerEmail().isBlank()) return;
        String name = dto.customerName() != null ? dto.customerName() : "Değerli Müşterimiz";
        String subject = "Siparişiniz alındı #" + dto.orderId();
        String body = String.format(
                "Merhaba %s,%n%nSipariş #%d başarıyla alındı.%nToplam: %.2f %s%n%nTeşekkürler!%n— Sepetify",
                name, dto.orderId(), dto.totalAmount(), dto.currency());
        emailSender.send(dto.customerEmail(), subject, body);
    }

    private void sendSlack(OrderConfirmedRequestDto dto) {
        slackSender.send(properties.slack().webhookUrl().isBlank() ? "#general" : "#all-n11-patika-case",
                String.format(":package: *Yeni Sipariş #%d*\nMüşteri: %s\nTutar: %.2f %s",
                        dto.orderId(), dto.customerEmail(), dto.totalAmount(), dto.currency()));
    }
}
