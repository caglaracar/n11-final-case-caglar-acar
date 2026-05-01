package com.caglar.auth.mapper;

import com.caglar.auth.dto.request.CreateUserRequestDto;
import com.caglar.auth.dto.response.AuthInfoResponseDto;
import com.caglar.auth.dto.response.RegisterResponseDto;
import com.caglar.auth.entity.Auth;
import com.caglar.auth.entity.RefreshToken;
import com.caglar.common.security.JwtTokenManager;

public final class AuthMapper {

    private AuthMapper() {}

    public static RegisterResponseDto toRegisterResponse(Auth auth) {
        return RegisterResponseDto.builder()
                .authId(auth.getId())
                .userName(auth.getUserName())
                .email(auth.getEmail())
                .role(auth.getRole().name())
                .build();
    }

    public static AuthInfoResponseDto toAuthInfoResponse(Auth auth) {
        return AuthInfoResponseDto.builder()
                .authId(auth.getId())
                .userName(auth.getUserName())
                .email(auth.getEmail())
                .role(auth.getRole().name())
                .build();
    }

    public static CreateUserRequestDto toCreateUserRequest(Auth auth) {
        return CreateUserRequestDto.builder()
                .authId(auth.getId())
                .userName(auth.getUserName())
                .email(auth.getEmail())
                .role(auth.getRole().name())
                .build();
    }

    public static RefreshToken toRefreshToken(Long authId, JwtTokenManager.RefreshToken rt) {
        return RefreshToken.builder()
                .authId(authId)
                .jti(rt.jti())
                .expiresAt(rt.expiresAt())
                .revoked(false)
                .build();
    }
}
