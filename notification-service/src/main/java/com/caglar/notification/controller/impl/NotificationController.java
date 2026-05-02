package com.caglar.notification.controller.impl;

import com.caglar.common.controller.BaseController;
import com.caglar.common.dto.BaseResponse;
import com.caglar.notification.dto.request.OrderConfirmedRequestDto;
import com.caglar.notification.sender.EmailSender;
import com.caglar.notification.sender.SlackSender;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static com.caglar.common.constant.RestApis.NOTIFICATION;

@Slf4j
@RestController
@RequestMapping(NOTIFICATION)
@RequiredArgsConstructor
public class NotificationController extends BaseController {

    private final EmailSender emailSender;
    private final SlackSender slackSender;

    @PostMapping("/order-confirmed")
    public ResponseEntity<BaseResponse<Boolean>> orderConfirmed(@RequestBody OrderConfirmedRequestDto dto) {
        log.info("order-confirmed notification orderId={} to={}", dto.orderId(), dto.customerEmail());
        if (dto.customerEmail() == null || dto.customerEmail().isBlank()) {
            return ok(false);
        }
        String subject = "Siparişiniz alındı #" + dto.orderId();
        String body = String.format(
                "Merhaba %s,%n%nSipariş #%d başarıyla alındı.%nToplam: %.2f %s%n%nTeşekkürler!%n— Sepetify",
                dto.customerName() != null ? dto.customerName() : "Değerli Müşterimiz",
                dto.orderId(),
                dto.totalAmount(),
                dto.currency()
        );
        emailSender.send(dto.customerEmail(), subject, body);
        slackSender.send("#all-n11-patika-case", String.format(
                ":package: *Yeni Sipariş #%d*\nMüşteri: %s\nTutar: %.2f %s",
                dto.orderId(),
                dto.customerEmail(),
                dto.totalAmount(),
                dto.currency()
        ));
        return ok(true);
    }
}
