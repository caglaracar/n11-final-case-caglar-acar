package com.caglar.auth.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Builder;

@Builder
public record RegisterRequestDto(

        @NotBlank
        @Size(min = 3, max = 30)
        @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "Sadece harf, rakam ve _ kullanılabilir")
        String userName,

        @NotBlank
        @Size(min = 6, max = 64)
        String password,

        @NotBlank
        @Size(min = 6, max = 64)
        String repassword,

        @NotBlank
        @Email
        String email
) {}
