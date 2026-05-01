package com.caglar.user.dto.response;

import lombok.Builder;

@Builder
public record AddressResponseDto(
        String id,
        String title,
        String fullName,
        String phone,
        String line1,
        String line2,
        String city,
        String state,
        String zipCode,
        String country,
        Boolean isDefault
) {}
