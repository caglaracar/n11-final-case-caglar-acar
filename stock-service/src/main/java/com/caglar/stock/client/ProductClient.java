package com.caglar.stock.client;

import com.caglar.common.dto.BaseResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "product-service", url = "${feign.product-service.url:}", path = "/dev/v1/product")
public interface ProductClient {

    @PutMapping("/{id}/stock")
    BaseResponse<Void> updateStock(@PathVariable String id, @RequestParam int quantity);
}
