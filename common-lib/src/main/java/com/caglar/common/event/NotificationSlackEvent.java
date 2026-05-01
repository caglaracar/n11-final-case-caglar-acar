package com.caglar.common.event;

public record NotificationSlackEvent(
        String channel,
        String text
) {}
