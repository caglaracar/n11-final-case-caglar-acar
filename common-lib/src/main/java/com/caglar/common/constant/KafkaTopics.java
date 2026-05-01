package com.caglar.common.constant;

public final class KafkaTopics {

    private KafkaTopics() {}

    public static final String ORDER_CREATED            = "order.created";
    public static final String PAYMENT_REQUESTED        = "payment.requested";
    public static final String PAYMENT_COMPLETED        = "payment.completed";
    public static final String PAYMENT_FAILED           = "payment.failed";
    public static final String STOCK_RESERVE_REQUESTED  = "stock.reserve.requested";
    public static final String STOCK_RESERVE_FAILED     = "stock.reserve.failed";
    public static final String STOCK_RESERVED           = "stock.reserved";
    public static final String STOCK_RELEASED           = "stock.released";
    public static final String NOTIFICATION_EMAIL       = "notification.email";
    public static final String NOTIFICATION_SLACK       = "notification.slack";
}
