package com.caglar.notification.helper;

import com.caglar.common.event.PaymentCompletedEvent;
import org.springframework.stereotype.Component;

@Component
public class OrderConfirmationMailFactory {

    private static final String SUBJECT_TEMPLATE = "Siparişiniz alındı – #%d";
    private static final String BODY_TEMPLATE = """
            Merhaba %s,

            Sipariş Alındı!
            Sipariş numaranız: #%d
            Tutar: %s %s

            Ödemeniz onaylandı. Kargo sürecine alındığında e-posta ile bilgilendirileceksiniz.

            Teşekkürler,
            n11-bootcamp ekibi""";

    public MailMessage build(String to, String greeting, PaymentCompletedEvent ev) {
        String subject = SUBJECT_TEMPLATE.formatted(ev.orderId());
        String body = BODY_TEMPLATE.formatted(
                greeting != null ? greeting : "Değerli müşterimiz",
                ev.orderId(), ev.amount(), ev.currency());
        return new MailMessage(to, subject, body);
    }
}
