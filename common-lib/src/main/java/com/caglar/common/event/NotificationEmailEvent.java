package com.caglar.common.event;

public record NotificationEmailEvent(
        String to,
        String subject,
        String body
) {}
