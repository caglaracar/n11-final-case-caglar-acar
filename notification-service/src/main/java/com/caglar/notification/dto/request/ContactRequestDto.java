package com.caglar.notification.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Builder;

@Builder
public record ContactRequestDto(
        @NotBlank @Size(max = 100) String name,
        @NotBlank @Email String email,
        @Size(max = 200) String subject,
        @NotBlank @Size(max = 4000) String message
) {}
