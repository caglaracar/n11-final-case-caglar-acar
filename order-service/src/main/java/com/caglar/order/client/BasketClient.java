package com.caglar.order.client;

import com.caglar.common.dto.BaseResponse;
import com.caglar.order.client.dto.BasketDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

@FeignClient(name = "basket-service", url = "${feign.basket-service.url:}", path = "/dev/v1/basket")
public interface BasketClient {

    @GetMapping
    BaseResponse<BasketDto> getMyBasket();
}
