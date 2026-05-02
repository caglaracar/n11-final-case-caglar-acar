package com.caglar.order.client.dto;

/** user-service GET /dev/v1/user-profile/me. */
public record UserProfileDto(
        String id,
        Long authId,
        String userName,
        String name,
        String surName,
        String email,
        String phone,
        String avatar,
        String role
) {}
