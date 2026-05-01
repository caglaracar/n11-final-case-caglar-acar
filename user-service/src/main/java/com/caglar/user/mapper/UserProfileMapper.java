package com.caglar.user.mapper;

import com.caglar.user.entity.UserProfile;
import com.caglar.user.dto.request.CreateUserRequestDto;
import com.caglar.user.dto.response.AuthInfoResponseDto;
import com.caglar.user.dto.response.UserProfileResponseDto;

public final class UserProfileMapper {

    private static final String DEFAULT_ROLE = "USER";

    private UserProfileMapper() {}

    public static UserProfileResponseDto toResponse(UserProfile up) {
        return UserProfileResponseDto.builder()
                .id(up.getId())
                .authId(up.getAuthId())
                .userName(up.getUserName())
                .name(up.getName())
                .surName(up.getSurName())
                .email(up.getEmail())
                .phone(up.getPhone())
                .avatar(up.getAvatar())
                .role(up.getRole())
                .createdAt(up.getCreatedAtUtc())
                .updatedAt(up.getUpdatedAtUtc())
                .build();
    }

    public static UserProfile fromCreateRequest(CreateUserRequestDto dto) {
        return UserProfile.builder()
                .authId(dto.authId())
                .userName(dto.userName())
                .email(dto.email())
                .role(dto.role() == null ? DEFAULT_ROLE : dto.role())
                .build();
    }

    public static UserProfile fromAuthInfo(AuthInfoResponseDto info) {
        return UserProfile.builder()
                .authId(info.authId())
                .userName(info.userName())
                .email(info.email())
                .role(info.role() == null ? DEFAULT_ROLE : info.role())
                .build();
    }
}
