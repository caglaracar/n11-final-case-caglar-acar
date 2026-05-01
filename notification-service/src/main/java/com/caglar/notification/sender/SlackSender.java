package com.caglar.notification.sender;

import com.caglar.notification.config.NotificationProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class SlackSender {
    private final RestTemplate restTemplate;
    private final NotificationProperties properties;

    public void send(String channel, String text) {
        String webhookUrl = properties.slack().webhookUrl();
        if (!StringUtils.hasText(webhookUrl)) {
            log.info("[Slack-NoOp] channel={} text={}", channel, text);
            return;
        }
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            Map<String, Object> body = Map.of("text", text, "channel", channel);
            restTemplate.postForEntity(webhookUrl, new HttpEntity<>(body, headers), String.class);
            log.info("Slack webhook sent channel={}", channel);
        } catch (Exception e) {
            log.warn("Slack send failed: {}", e.getMessage());
        }
    }
}
