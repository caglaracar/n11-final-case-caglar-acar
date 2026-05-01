package com.caglar.user.service;

import com.caglar.user.dto.request.AddressRequestDto;
import com.caglar.user.dto.response.AddressResponseDto;

import java.util.List;

public interface AddressService {
    List<AddressResponseDto> getList(Long authId);
    AddressResponseDto create(Long authId, AddressRequestDto dto);
    AddressResponseDto update(Long authId, String addressId, AddressRequestDto dto);
    void remove(Long authId, String addressId);
    AddressResponseDto setDefault(Long authId, String addressId);
}
