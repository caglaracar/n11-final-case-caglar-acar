package com.caglar.common.constant;

public final class KafkaTopics {

    private KafkaTopics() {}

    /** payment-service → order-service: iyzico callback başarılı. */
    public static final String PAYMENT_COMPLETED = "payment.completed";

    /** payment-service → order-service: iyzico callback başarısız. */
    public static final String PAYMENT_FAILED = "payment.failed";

    /** order-service → notification-service: PAID statüsüne geçiş. */
    public static final String ORDER_PLACED = "order.placed";

    /** Generic mail kuyruğu (notification-service tüketir). */
    public static final String NOTIFICATION_EMAIL = "notification.email";

    /** Generic Slack kuyruğu (notification-service tüketir). */
    public static final String NOTIFICATION_SLACK = "notification.slack";
}
