package com.caglar.user.dto.response;

import lombok.Builder;

@Builder
public record AuthInfoResponseDto(
        Long authId,
        String userName,
        String email,
        String role
) {}
