package com.caglar.user.service.impl;

import com.caglar.common.exception.BusinessException;
import com.caglar.common.exception.ErrorType;
import com.caglar.user.entity.Address;
import com.caglar.user.entity.UserProfile;
import com.caglar.user.dto.request.AddressRequestDto;
import com.caglar.user.dto.response.AddressResponseDto;
import com.caglar.user.mapper.AddressMapper;
import com.caglar.user.repository.UserProfileRepository;
import com.caglar.user.service.AddressService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AddressServiceImpl implements AddressService {

    private final UserProfileRepository userProfileRepository;

    @Override
    public List<AddressResponseDto> getList(Long authId) {
        return requireProfile(authId).getAddresses().stream()
                .map(AddressMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public AddressResponseDto create(Long authId, AddressRequestDto dto) {
        UserProfile profile = requireProfile(authId);
        Address address = AddressMapper.fromRequest(dto);
        address.setId(UUID.randomUUID().toString());
        profile.addAddress(address, Boolean.TRUE.equals(dto.isDefault()));
        userProfileRepository.save(profile);
        return AddressMapper.toResponse(address);
    }

    @Override
    @Transactional
    public AddressResponseDto update(Long authId, String addressId, AddressRequestDto dto) {
        UserProfile profile = requireProfile(authId);
        Address address = requireAddress(profile, addressId);
        address.mergeFrom(AddressMapper.fromRequest(dto));
        if (Boolean.TRUE.equals(dto.isDefault())) {
            profile.markAddressAsDefault(address);
        }
        userProfileRepository.save(profile);
        return AddressMapper.toResponse(address);
    }

    @Override
    @Transactional
    public void remove(Long authId, String addressId) {
        UserProfile profile = requireProfile(authId);
        if (!profile.removeAddress(addressId)) {
            throw new BusinessException(ErrorType.NOT_FOUND, "Adres bulunamadı");
        }
        userProfileRepository.save(profile);
    }

    @Override
    @Transactional
    public AddressResponseDto setDefault(Long authId, String addressId) {
        UserProfile profile = requireProfile(authId);
        Address address = requireAddress(profile, addressId);
        profile.markAddressAsDefault(address);
        userProfileRepository.save(profile);
        return AddressMapper.toResponse(address);
    }

    private UserProfile requireProfile(Long authId) {
        return userProfileRepository.findByAuthId(authId)
                .orElseThrow(() -> new BusinessException(ErrorType.USER_NOT_FOUND));
    }

    private Address requireAddress(UserProfile profile, String addressId) {
        Address address = profile.findAddress(addressId);
        if (address == null) {
            throw new BusinessException(ErrorType.NOT_FOUND, "Adres bulunamadı");
        }
        return address;
    }
}
