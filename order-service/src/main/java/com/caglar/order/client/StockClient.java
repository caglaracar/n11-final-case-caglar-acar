package com.caglar.order.client;

import com.caglar.common.dto.BaseResponse;
import com.caglar.order.client.dto.StockOpRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "stock-service", url = "${feign.stock-service.url:}", path = "/dev/v1/stock")
public interface StockClient {

    @PostMapping("/reserve")
    BaseResponse<Void> reserve(@RequestBody StockOpRequest req);

    @PostMapping("/release")
    BaseResponse<Void> release(@RequestBody StockOpRequest req);
}
