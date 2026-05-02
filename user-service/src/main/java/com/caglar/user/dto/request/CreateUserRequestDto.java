package com.caglar.user.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

@Builder
public record CreateUserRequestDto(

        @NotNull
        Long authId,

        @NotBlank
        String userName,

        @Email
        @NotBlank
        String email,

        String role
) {}
