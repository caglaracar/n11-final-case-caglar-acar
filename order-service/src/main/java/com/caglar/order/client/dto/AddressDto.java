package com.caglar.order.client.dto;

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
