package com.caglar.order.client.dto;

/** user-service GET /dev/v1/address. */
public record AddressDto(
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
