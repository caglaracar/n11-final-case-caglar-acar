package com.caglar.user.client;

import com.caglar.common.dto.BaseResponse;
import com.caglar.user.dto.response.AuthInfoResponseDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import static com.caglar.common.constant.RestApis.AUTH;

@FeignClient(name = "auth-service", contextId = "authServiceClient", path = AUTH)
public interface AuthServiceClient {

    @GetMapping("/internal/{authId}")
    ResponseEntity<BaseResponse<AuthInfoResponseDto>> getByAuthId(@PathVariable("authId") Long authId);
}
