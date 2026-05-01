package com.caglar.user.service.impl;

import com.caglar.common.exception.BusinessException;
import com.caglar.common.exception.ErrorType;
import com.caglar.user.entity.UserProfile;
import com.caglar.user.dto.request.CreateUserRequestDto;
import com.caglar.user.dto.request.UpdateUserProfileRequestDto;
import com.caglar.user.dto.response.AuthInfoResponseDto;
import com.caglar.user.dto.response.UserProfileResponseDto;
import com.caglar.user.helper.AuthInfoLookup;
import com.caglar.user.mapper.UserProfileMapper;
import com.caglar.user.repository.UserProfileRepository;
import com.caglar.user.service.UserProfileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserProfileServiceImpl implements UserProfileService {

    private final UserProfileRepository userProfileRepository;
    private final AuthInfoLookup authInfoLookup;

    @Override
    @Transactional
    public Boolean create(CreateUserRequestDto dto) {
        if (userProfileRepository.existsByAuthId(dto.authId())) {
            return true;
        }
        userProfileRepository.save(UserProfileMapper.fromCreateRequest(dto));
        return true;
    }

    @Override
    public UserProfileResponseDto getMe(Long authId) {
        return UserProfileMapper.toResponse(findOrBackfill(authId));
    }

    @Override
    @Transactional
    public UserProfileResponseDto update(Long authId, UpdateUserProfileRequestDto dto) {
        UserProfile profile = findOrBackfill(authId);
        profile.applyProfilePatch(dto.name(), dto.surName(), dto.phone(), dto.avatar());
        return UserProfileMapper.toResponse(userProfileRepository.save(profile));
    }

    @Override
    public Page<UserProfileResponseDto> search(String query, String role, Pageable pageable) {
        return queryProfiles(query == null ? "" : query, role, pageable)
                .map(UserProfileMapper::toResponse);
    }

    private Page<UserProfile> queryProfiles(String q, String role, Pageable pageable) {
        if (role == null || role.isBlank()) {
            return userProfileRepository.findByUserNameContainingIgnoreCaseOrEmailContainingIgnoreCase(q, q, pageable);
        }
        return userProfileRepository.findByRoleAndQuery(role, q, pageable);
    }

    /** Profil yoksa auth-service'ten bilgi çekip oluşturur (idempotent backfill). */
    private UserProfile findOrBackfill(Long authId) {
        return userProfileRepository.findByAuthId(authId).orElseGet(() -> backfillFromAuth(authId));
    }

    private UserProfile backfillFromAuth(Long authId) {
        AuthInfoResponseDto info = authInfoLookup.require(authId);
        log.info("UserProfile backfill: authId={}, userName={}", info.authId(), info.userName());
        return userProfileRepository.save(UserProfileMapper.fromAuthInfo(info));
    }
}
