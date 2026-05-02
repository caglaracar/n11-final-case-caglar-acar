package com.caglar.auth.controller.impl;

import com.caglar.auth.controller.IAuthApi;
import com.caglar.auth.dto.request.LoginRequestDto;
import com.caglar.auth.dto.request.RefreshRequestDto;
import com.caglar.auth.dto.request.RegisterAdminRequestDto;
import com.caglar.auth.dto.request.RegisterRequestDto;
import com.caglar.auth.dto.response.AuthInfoResponseDto;
import com.caglar.auth.dto.response.RegisterResponseDto;
import com.caglar.auth.dto.response.TokenResponseDto;
import com.caglar.auth.service.AuthService;
import com.caglar.common.controller.BaseController;
import com.caglar.common.dto.BaseResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static com.caglar.common.constant.RestApis.AUTH;
import static com.caglar.common.constant.RestApis.LOGIN;
import static com.caglar.common.constant.RestApis.LOGOUT;
import static com.caglar.common.constant.RestApis.REFRESH;
import static com.caglar.common.constant.RestApis.REGISTER;

@RestController
@RequestMapping(AUTH)
@RequiredArgsConstructor
public class AuthController extends BaseController implements IAuthApi {

    private final AuthService authService;

    @Override
    @PostMapping(REGISTER)
    public ResponseEntity<BaseResponse<RegisterResponseDto>> register(@Valid @RequestBody RegisterRequestDto dto) {
        return created(authService.register(dto));
    }

    @Override
    @PostMapping("/admin/register")
    public ResponseEntity<BaseResponse<RegisterResponseDto>> registerAdmin(@Valid @RequestBody RegisterAdminRequestDto dto) {
        return created(authService.registerAdmin(dto));
    }

    @Override
    @PostMapping(LOGIN)
    public ResponseEntity<BaseResponse<TokenResponseDto>> login(@Valid @RequestBody LoginRequestDto dto) {
        return ok(authService.login(dto));
    }

    @Override
    @PostMapping(REFRESH)
    public ResponseEntity<BaseResponse<TokenResponseDto>> refresh(@Valid @RequestBody RefreshRequestDto dto) {
        return ok(authService.refresh(dto));
    }

    @Override
    @PostMapping(LOGOUT)
    public ResponseEntity<BaseResponse<Void>> logout(@Valid @RequestBody RefreshRequestDto dto) {
        authService.logout(dto);
        return ok();
    }

    @GetMapping("/internal/{authId}")
    public ResponseEntity<BaseResponse<AuthInfoResponseDto>> getByAuthId(@PathVariable Long authId) {
        return ok(authService.getByAuthId(authId));
    }
}
