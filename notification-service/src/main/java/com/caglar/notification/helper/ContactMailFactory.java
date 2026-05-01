package com.caglar.notification.helper;

import com.caglar.notification.dto.request.ContactRequestDto;
import org.springframework.stereotype.Component;

@Component
public class ContactMailFactory {

    private static final String SUBJECT_PREFIX = "[İletişim] ";
    private static final String BODY_TEMPLATE = "Gönderen: %s <%s>\n\n%s";

    public MailMessage build(String adminMail, ContactRequestDto dto) {
        String subject = SUBJECT_PREFIX + (dto.subject() == null ? "(Konu yok)" : dto.subject());
        String body = BODY_TEMPLATE.formatted(dto.name(), dto.email(), dto.message());
        return new MailMessage(adminMail, subject, body);
    }
}
