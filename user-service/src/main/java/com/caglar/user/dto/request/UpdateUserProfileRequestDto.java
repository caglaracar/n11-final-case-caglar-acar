package com.caglar.user.dto.request;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Builder;

@Builder
public record UpdateUserProfileRequestDto(

        @Size(max = 60)
        String name,

        @Size(max = 60)
        String surName,

        @Pattern(regexp = "^[+]?[0-9 ()-]{6,20}$", message = "Telefon formatı geçersiz")
        String phone,

        String avatar
) {}
