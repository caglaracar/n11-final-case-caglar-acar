package com.caglar.notification.helper;

/** Internal value object — mail factory'leri tarafından üretilen ve {@code EmailSender}'a verilen yapı. */
public record MailMessage(String to, String subject, String body) {}
