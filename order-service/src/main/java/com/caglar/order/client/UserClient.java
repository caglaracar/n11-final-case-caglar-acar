package com.caglar.order.client;

import com.caglar.common.dto.BaseResponse;
import com.caglar.order.client.dto.AddressDto;
import com.caglar.order.client.dto.UserProfileDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@FeignClient(name = "user-service", url = "${feign.user-service.url:}")
public interface UserClient {

    @GetMapping("/dev/v1/user-profile/me")
    BaseResponse<UserProfileDto> me();

    @GetMapping("/dev/v1/address")
    BaseResponse<List<AddressDto>> myAddresses();
}
