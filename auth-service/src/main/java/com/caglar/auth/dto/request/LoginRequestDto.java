package com.caglar.auth.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

@Builder
public record LoginRequestDto(

        @NotBlank
        String userName,

        @NotBlank
        String password
) {}
