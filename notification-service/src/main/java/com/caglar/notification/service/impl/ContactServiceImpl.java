package com.caglar.notification.service.impl;

import com.caglar.notification.config.NotificationProperties;
import com.caglar.notification.dto.request.ContactRequestDto;
import com.caglar.notification.helper.ContactMailFactory;
import com.caglar.notification.helper.MailMessage;
import com.caglar.notification.sender.EmailSender;
import com.caglar.notification.service.ContactService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class ContactServiceImpl implements ContactService {

    private final EmailSender emailSender;
    private final ContactMailFactory contactMailFactory;
    private final NotificationProperties properties;

    @Override
    public void submit(ContactRequestDto dto) {
        log.info("Contact form received: name={} email={} subject={}", dto.name(), dto.email(), dto.subject());
        MailMessage msg = contactMailFactory.build(properties.contact().to(), dto);
        emailSender.sendReplyTo(msg, dto.email());
    }
}
