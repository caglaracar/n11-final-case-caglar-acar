package com.caglar.common.constant;

public final class KafkaTopics {

    private KafkaTopics() {}

    public static final String PAYMENT_COMPLETED = "payment.completed";

    public static final String PAYMENT_FAILED = "payment.failed";

    public static final String ORDER_PLACED = "order.placed";

    public static final String NOTIFICATION_EMAIL = "notification.email";

    public static final String NOTIFICATION_SLACK = "notification.slack";
}
