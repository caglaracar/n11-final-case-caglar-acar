package com.caglar.user.mapper;

import com.caglar.user.entity.Address;
import com.caglar.user.dto.request.AddressRequestDto;
import com.caglar.user.dto.response.AddressResponseDto;

public final class AddressMapper {

    private AddressMapper() {}

    public static AddressResponseDto toResponse(Address a) {
        return AddressResponseDto.builder()
                .id(a.getId())
                .title(a.getTitle())
                .fullName(a.getFullName())
                .phone(a.getPhone())
                .line1(a.getLine1())
                .line2(a.getLine2())
                .city(a.getCity())
                .state(a.getState())
                .zipCode(a.getZipCode())
                .country(a.getCountry())
                .isDefault(a.getIsDefault())
                .build();
    }

    public static Address fromRequest(AddressRequestDto dto) {
        return Address.builder()
                .title(dto.title())
                .fullName(dto.fullName())
                .phone(dto.phone())
                .line1(dto.line1())
                .line2(dto.line2())
                .city(dto.city())
                .state(dto.state())
                .zipCode(dto.zipCode())
                .country(dto.country())
                .isDefault(Boolean.TRUE.equals(dto.isDefault()))
                .build();
    }
}
