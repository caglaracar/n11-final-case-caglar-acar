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

        /** Auth-service rol adı (USER, SELLER, ADMIN). Eski çağrılar için opsiyonel. */
        String role
) {}
