package com.caglar.user.dto.response;

import lombok.Builder;

import java.time.Instant;

@Builder
public record UserProfileResponseDto(
        String id,
        Long authId,
        String userName,
        String name,
        String surName,
        String email,
        String phone,
        String avatar,
        String role,
        Instant createdAt,
        Instant updatedAt
) {}
