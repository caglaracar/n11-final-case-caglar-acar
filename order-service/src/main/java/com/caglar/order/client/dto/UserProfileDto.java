package com.caglar.order.client.dto;

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
