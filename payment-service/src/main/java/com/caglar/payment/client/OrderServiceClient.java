package com.caglar.payment.client;

import com.caglar.common.dto.BaseResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import static com.caglar.common.constant.RestApis.FIND_BY_ID;
import static com.caglar.common.constant.RestApis.ORDER;

@FeignClient(name = "order-service", contextId = "orderServiceClient", path = ORDER)
public interface OrderServiceClient {

    @GetMapping(FIND_BY_ID + "/{id}")
    ResponseEntity<BaseResponse<OrderSummary>> getById(@PathVariable("id") Long id);

    record OrderSummary(
            Long id,
            Long authId,
            String status,
            Double totalAmount,
            String currency
    ) {}
}
