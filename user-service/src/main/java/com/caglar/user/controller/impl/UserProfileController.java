package com.caglar.user.controller.impl;

import com.caglar.user.controller.IUserProfileApi;
import com.caglar.common.controller.BaseController;
import com.caglar.common.dto.BaseResponse;
import com.caglar.user.dto.request.CreateUserRequestDto;
import com.caglar.user.dto.request.UpdateUserProfileRequestDto;
import com.caglar.user.dto.response.UserProfileResponseDto;
import com.caglar.user.service.UserProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import static com.caglar.common.constant.RestApis.CREATE_USER;
import static com.caglar.common.constant.RestApis.ME;
import static com.caglar.common.constant.RestApis.SEARCH;
import static com.caglar.common.constant.RestApis.UPDATE;
import static com.caglar.common.constant.RestApis.USER;

@RestController
@RequestMapping(USER)
@RequiredArgsConstructor
public class UserProfileController extends BaseController implements IUserProfileApi {

    private final UserProfileService userProfileService;

    @Override
    @PostMapping(CREATE_USER)
    public ResponseEntity<BaseResponse<Boolean>> create(@Valid @RequestBody CreateUserRequestDto dto) {
        return created(userProfileService.create(dto));
    }

    @Override
    @GetMapping(ME)
    public ResponseEntity<BaseResponse<UserProfileResponseDto>> me(@RequestHeader("X-User-Id") Long authId) {
        return ok(userProfileService.getMe(authId));
    }

    @Override
    @PutMapping(UPDATE)
    public ResponseEntity<BaseResponse<UserProfileResponseDto>> update(
            @RequestHeader("X-User-Id") Long authId,
            @Valid @RequestBody UpdateUserProfileRequestDto dto) {
        return ok(userProfileService.update(authId, dto));
    }

    @Override
    @GetMapping(SEARCH)
    public ResponseEntity<BaseResponse<Page<UserProfileResponseDto>>> search(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String role,
            Pageable pageable) {
        return ok(userProfileService.search(q, role, pageable));
    }
}
