package com.caglar.notification.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "notification")
public record NotificationProperties(
        Mail mail,
        Slack slack
) {

    public NotificationProperties {
        if (mail == null) {
            mail  = new Mail("no-reply@n11-bootcamp.local");
        }
        if (slack == null) {
            slack = new Slack("");
        }
    }

    public record Mail(String from) {}
    public record Slack(String webhookUrl) {}
}
