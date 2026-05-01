package com.caglar.user.service;

import com.caglar.user.dto.request.CreateUserRequestDto;
import com.caglar.user.dto.request.UpdateUserProfileRequestDto;
import com.caglar.user.dto.response.UserProfileResponseDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserProfileService {

    Boolean create(CreateUserRequestDto dto);

    UserProfileResponseDto getMe(Long authId);

    UserProfileResponseDto update(Long authId, UpdateUserProfileRequestDto dto);

    Page<UserProfileResponseDto> search(String query, String role, Pageable pageable);
}
