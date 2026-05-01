package com.caglar.notification.sender;

import com.caglar.notification.config.NotificationProperties;
import com.caglar.notification.helper.MailMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class EmailSender {

    private final JavaMailSender javaMailSender;
    private final NotificationProperties properties;

    public void send(String to, String subject, String body) {
        send(new MailMessage(to, subject, body));
    }

    public void send(MailMessage msg) {
        sendInternal(msg, null);
    }

    public void sendReplyTo(MailMessage msg, String replyTo) {
        sendInternal(msg, replyTo);
    }

    private void sendInternal(MailMessage msg, String replyTo) {
        try {
            SimpleMailMessage out = new SimpleMailMessage();
            out.setFrom(properties.mail().from());
            out.setTo(msg.to());
            out.setSubject(msg.subject());
            out.setText(msg.body());
            if (replyTo != null) {
                out.setReplyTo(replyTo);
            }
            javaMailSender.send(out);
            log.info("Mail sent to={} subject={}", msg.to(), msg.subject());
        } catch (Exception e) {
            log.warn("Mail send failed (dev MailHog kapalı olabilir): {}", e.getMessage());
        }
    }
}
