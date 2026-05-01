package com.caglar.user.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

@Builder
public record AddressRequestDto(
        String title,
        @NotBlank String fullName,
        String phone,
        @NotBlank String line1,
        String line2,
        @NotBlank String city,
        String state,
        @NotBlank String zipCode,
        String country,
        Boolean isDefault
) {}
