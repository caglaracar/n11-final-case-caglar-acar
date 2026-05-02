package com.caglar.order.client;

import com.caglar.common.dto.BaseResponse;
import com.caglar.order.client.dto.InitCheckoutRequest;
import com.caglar.order.client.dto.InitCheckoutResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "payment-service", url = "${feign.payment-service.url:}", path = "/dev/v1/payment")
public interface PaymentClient {

    @PostMapping("/init")
    BaseResponse<InitCheckoutResponse> initiate(@RequestBody InitCheckoutRequest req);
}
