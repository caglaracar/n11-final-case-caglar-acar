package com.caglar.auth.client;

import com.caglar.auth.dto.request.CreateUserRequestDto;
import com.caglar.common.dto.BaseResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import static com.caglar.common.constant.RestApis.CREATE_USER;
import static com.caglar.common.constant.RestApis.USER;

@FeignClient(name = "user-service", contextId = "userServiceClient", path = USER)
public interface UserServiceClient {

    @PostMapping(CREATE_USER)
    ResponseEntity<BaseResponse<Boolean>> create(@RequestBody CreateUserRequestDto dto);
}
