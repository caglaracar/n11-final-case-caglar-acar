package com.caglar.auth.dto.response;

import lombok.Builder;

@Builder
public record TokenResponseDto(
        String accessToken,
        String refreshToken,
        long expiresIn,
        String tokenType
) {

    public static TokenResponseDto of(String access, String refresh, long expiresIn) {
        return TokenResponseDto.builder()
                .accessToken(access)
                .refreshToken(refresh)
                .expiresIn(expiresIn)
                .tokenType("Bearer")
                .build();
    }
}
