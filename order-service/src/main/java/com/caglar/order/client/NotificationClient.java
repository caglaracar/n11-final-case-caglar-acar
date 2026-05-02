package com.caglar.order.client;

import com.caglar.common.dto.BaseResponse;
import com.caglar.order.client.dto.OrderConfirmedNotificationRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "notification-service", url = "${feign.notification-service.url:}", path = "/dev/v1/notification")
public interface NotificationClient {

    @PostMapping("/order-confirmed")
    BaseResponse<Boolean> sendOrderConfirmed(@RequestBody OrderConfirmedNotificationRequest request);
}
