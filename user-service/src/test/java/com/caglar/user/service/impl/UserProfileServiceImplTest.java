package com.caglar.user.service.impl;

import com.caglar.common.exception.BusinessException;
import com.caglar.user.dto.request.CreateUserRequestDto;
import com.caglar.user.dto.request.UpdateUserProfileRequestDto;
import com.caglar.user.dto.response.AuthInfoResponseDto;
import com.caglar.user.dto.response.UserProfileResponseDto;
import com.caglar.user.entity.UserProfile;
import com.caglar.user.helper.AuthInfoLookup;
import com.caglar.user.repository.UserProfileRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;

@ExtendWith(MockitoExtension.class)
class UserProfileServiceImplTest {

    @Mock UserProfileRepository userProfileRepository;
    @Mock AuthInfoLookup authInfoLookup;

    @InjectMocks UserProfileServiceImpl service;

    // ─── create ──────────────────────────────────────────────────

    @Test
    void create_savesProfileAndReturnsTrue_whenNotExists() {
        given(userProfileRepository.existsByAuthId(1L)).willReturn(false);
        given(userProfileRepository.save(any())).willReturn(buildProfile(1L, "caglar"));

        Boolean result = service.create(new CreateUserRequestDto(1L, "caglar", "caglar@mail.com", "USER"));

        assertThat(result).isTrue();
        then(userProfileRepository).should().save(any());
    }

    @Test
    void create_isIdempotent_whenProfileAlreadyExists() {
        given(userProfileRepository.existsByAuthId(1L)).willReturn(true);

        Boolean result = service.create(new CreateUserRequestDto(1L, "caglar", "caglar@mail.com", "USER"));

        assertThat(result).isTrue();
        then(userProfileRepository).shouldHaveNoMoreInteractions();
    }

    // ─── getMe ───────────────────────────────────────────────────

    @Test
    void getMe_returnsProfile_whenExists() {
        UserProfile profile = buildProfile(1L, "caglar");
        given(userProfileRepository.findByAuthId(1L)).willReturn(Optional.of(profile));

        UserProfileResponseDto result = service.getMe(1L);

        assertThat(result.userName()).isEqualTo("caglar");
    }

    @Test
    void getMe_backfillsFromAuthService_whenProfileNotFound() {
        given(userProfileRepository.findByAuthId(99L)).willReturn(Optional.empty());
        given(authInfoLookup.require(99L)).willReturn(
                new AuthInfoResponseDto(99L, "newuser", "new@mail.com", "USER"));
        given(userProfileRepository.save(any())).willReturn(buildProfile(99L, "newuser"));

        UserProfileResponseDto result = service.getMe(99L);

        assertThat(result.userName()).isEqualTo("newuser");
        then(authInfoLookup).should().require(99L);
    }

    @Test
    void getMe_throwsException_whenAuthServiceAlsoFails() {
        given(userProfileRepository.findByAuthId(99L)).willReturn(Optional.empty());
        given(authInfoLookup.require(99L)).willThrow(new BusinessException(
                com.caglar.common.exception.ErrorType.USER_NOT_FOUND));

        assertThatThrownBy(() -> service.getMe(99L))
                .isInstanceOf(BusinessException.class);
    }

    // ─── update ──────────────────────────────────────────────────

    @Test
    void update_appliesPatchAndSaves() {
        UserProfile profile = buildProfile(1L, "caglar");
        given(userProfileRepository.findByAuthId(1L)).willReturn(Optional.of(profile));
        given(userProfileRepository.save(any())).willReturn(profile);

        UserProfileResponseDto result = service.update(1L,
                new UpdateUserProfileRequestDto("Çağlar", "Acar", "+905551112233", null));

        assertThat(result.userName()).isEqualTo("caglar");
        then(userProfileRepository).should().save(profile);
    }

    // ─── search ──────────────────────────────────────────────────

    @Test
    void search_returnsPage_withoutRoleFilter() {
        Page<UserProfile> page = new PageImpl<>(List.of(buildProfile(1L, "caglar")));
        given(userProfileRepository.findByUserNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
                "cag", "cag", PageRequest.of(0, 10))).willReturn(page);

        Page<UserProfileResponseDto> result = service.search("cag", null, PageRequest.of(0, 10));

        assertThat(result.getContent()).hasSize(1);
    }

    @Test
    void search_returnsPage_withRoleFilter() {
        Page<UserProfile> page = new PageImpl<>(List.of(buildProfile(1L, "admin")));
        given(userProfileRepository.findByRoleAndQuery("ADMIN", "ad", PageRequest.of(0, 10)))
                .willReturn(page);

        Page<UserProfileResponseDto> result = service.search("ad", "ADMIN", PageRequest.of(0, 10));

        assertThat(result.getContent()).hasSize(1);
    }

    // ─── helpers ─────────────────────────────────────────────────

    private UserProfile buildProfile(Long authId, String userName) {
        return UserProfile.builder()
                .authId(authId)
                .userName(userName)
                .email(userName + "@mail.com")
                .role("USER")
                .build();
    }
}
