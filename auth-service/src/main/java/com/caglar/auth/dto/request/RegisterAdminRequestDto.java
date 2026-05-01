package com.caglar.auth.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Builder;

/**
 * Admin kayıt isteği. Normal register'dan farkı:
 *  - `inviteCode` zorunlu (sunucu tarafındaki secret ile eşleşmeli).
 *  - Sonuçta oluşturulan Auth `Role.ADMIN` olur.
 */
@Builder
public record RegisterAdminRequestDto(

        @NotBlank
        @Size(min = 3, max = 30)
        @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "Sadece harf, rakam ve _ kullanılabilir")
        String userName,

        @NotBlank
        @Size(min = 8, max = 64)
        String password,

        @NotBlank
        @Size(min = 8, max = 64)
        String repassword,

        @NotBlank
        @Email
        String email,

        @NotBlank
        String inviteCode
) {}
