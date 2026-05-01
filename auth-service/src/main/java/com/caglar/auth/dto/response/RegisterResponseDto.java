package com.caglar.auth.dto.response;

import lombok.Builder;

@Builder
public record RegisterResponseDto(
        Long authId,
        String userName,
        String email,
        String role
) {}
