package com.caglar.auth.service.impl;

import com.caglar.auth.client.UserServiceClient;
import com.caglar.auth.config.AuthProperties;
import com.caglar.auth.dto.request.LoginRequestDto;
import com.caglar.auth.dto.request.RefreshRequestDto;
import com.caglar.auth.dto.request.RegisterRequestDto;
import com.caglar.auth.dto.response.RegisterResponseDto;
import com.caglar.auth.dto.response.TokenResponseDto;
import com.caglar.auth.entity.Auth;
import com.caglar.auth.entity.RefreshToken;
import com.caglar.auth.enums.Role;
import com.caglar.auth.repository.AuthRepository;
import com.caglar.auth.repository.RefreshTokenRepository;
import com.caglar.auth.validator.AuthValidator;
import com.caglar.common.exception.BusinessException;
import com.caglar.common.exception.ErrorType;
import com.caglar.common.security.JwtTokenManager;
import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;
import static org.mockito.BDDMockito.willDoNothing;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock AuthRepository authRepository;
    @Mock RefreshTokenRepository refreshTokenRepository;
    @Mock PasswordEncoder passwordEncoder;
    @Mock AuthValidator authValidator;
    @Mock JwtTokenManager jwtTokenManager;
    @Mock UserServiceClient userServiceClient;
    @Mock AuthProperties.Jwt jwtProperties;

    @InjectMocks AuthServiceImpl service;

    @Test
    void register_savesUserAndReturnsResponse() {
        willDoNothing().given(authValidator).validatePasswordsMatch(anyString(), anyString());
        given(authRepository.existsByUserName("testuser")).willReturn(false);
        given(authRepository.existsByEmail("test@mail.com")).willReturn(false);
        given(passwordEncoder.encode("pass123")).willReturn("encoded");

        Auth saved = buildAuth(1L, "testuser", "test@mail.com", Role.USER);
        given(authRepository.save(any())).willReturn(saved);

        RegisterResponseDto result = service.register(new RegisterRequestDto("testuser", "pass123", "pass123", "test@mail.com"));

        assertThat(result.userName()).isEqualTo("testuser");
        then(authRepository).should().save(any());
    }

    @Test
    void register_throwsException_whenUserNameTaken() {
        willDoNothing().given(authValidator).validatePasswordsMatch(anyString(), anyString());
        given(authRepository.existsByUserName("taken")).willReturn(true);

        assertThatThrownBy(() -> service.register(new RegisterRequestDto("taken", "p", "p", "mail@x.com")))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("kullanılıyor");
    }

    @Test
    void register_throwsException_whenEmailTaken() {
        willDoNothing().given(authValidator).validatePasswordsMatch(anyString(), anyString());
        given(authRepository.existsByUserName("user")).willReturn(false);
        given(authRepository.existsByEmail("taken@mail.com")).willReturn(true);

        assertThatThrownBy(() -> service.register(new RegisterRequestDto("user", "p", "p", "taken@mail.com")))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("kullanılıyor");
    }

    @Test
    void login_byUsername_returnsTokens() {
        Auth auth = buildAuth(1L, "user", "user@mail.com", Role.USER);
        given(authRepository.findByUserName("user")).willReturn(Optional.of(auth));
        given(passwordEncoder.matches("pass", "encoded_pass")).willReturn(true);
        given(jwtProperties.accessTtlSeconds()).willReturn(900L);
        given(jwtTokenManager.createAccessToken(1L, "USER")).willReturn("access");
        JwtTokenManager.RefreshToken rt = new JwtTokenManager.RefreshToken("refresh", "jti-1", Instant.now().plusSeconds(86400).toEpochMilli());
        given(jwtTokenManager.createRefreshToken(1L, "USER")).willReturn(rt);
        given(refreshTokenRepository.save(any())).willReturn(null);

        TokenResponseDto result = service.login(new LoginRequestDto("user", "pass"));

        assertThat(result.accessToken()).isEqualTo("access");
        assertThat(result.refreshToken()).isEqualTo("refresh");
    }

    @Test
    void login_byEmail_returnsTokens() {
        Auth auth = buildAuth(2L, "user2", "user2@mail.com", Role.USER);
        given(authRepository.findByEmail("user2@mail.com")).willReturn(Optional.of(auth));
        given(passwordEncoder.matches("pass", "encoded_pass")).willReturn(true);
        given(jwtProperties.accessTtlSeconds()).willReturn(900L);
        given(jwtTokenManager.createAccessToken(2L, "USER")).willReturn("access");
        JwtTokenManager.RefreshToken rt = new JwtTokenManager.RefreshToken("refresh", "jti-2", Instant.now().plusSeconds(86400).toEpochMilli());
        given(jwtTokenManager.createRefreshToken(2L, "USER")).willReturn(rt);
        given(refreshTokenRepository.save(any())).willReturn(null);

        TokenResponseDto result = service.login(new LoginRequestDto("user2@mail.com", "pass"));

        assertThat(result.accessToken()).isEqualTo("access");
    }

    @Test
    void login_throwsException_whenPasswordWrong() {
        Auth auth = buildAuth(1L, "user", "user@mail.com", Role.USER);
        given(authRepository.findByUserName("user")).willReturn(Optional.of(auth));
        given(passwordEncoder.matches("wrong", "encoded_pass")).willReturn(false);

        assertThatThrownBy(() -> service.login(new LoginRequestDto("user", "wrong")))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void login_throwsException_whenUserNotFound() {
        given(authRepository.findByUserName("ghost")).willReturn(Optional.empty());
        given(authRepository.findByEmail("ghost")).willReturn(Optional.empty());

        assertThatThrownBy(() -> service.login(new LoginRequestDto("ghost", "pass")))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void refresh_revokesOldTokenAndIssuesNew() {
        Claims claims = org.mockito.Mockito.mock(Claims.class);
        given(claims.getId()).willReturn("jti-old");
        given(claims.get("typ", String.class)).willReturn("refresh");

        RefreshToken storedToken = RefreshToken.builder()
                .jti("jti-old")
                .authId(1L)
                .expiresAt(Instant.now().plusSeconds(3600).toEpochMilli())
                .revoked(false)
                .build();

        Auth auth = buildAuth(1L, "user", "user@mail.com", Role.USER);

        given(jwtTokenManager.parse("refresh_token")).willReturn(Optional.of(claims));
        given(refreshTokenRepository.findByJti("jti-old")).willReturn(Optional.of(storedToken));
        given(refreshTokenRepository.save(any())).willReturn(null);
        given(authRepository.findById(1L)).willReturn(Optional.of(auth));
        given(jwtProperties.accessTtlSeconds()).willReturn(900L);
        given(jwtTokenManager.createAccessToken(1L, "USER")).willReturn("new_access");
        JwtTokenManager.RefreshToken newRt = new JwtTokenManager.RefreshToken("new_refresh", "jti-new", Instant.now().plusSeconds(86400).toEpochMilli());
        given(jwtTokenManager.createRefreshToken(1L, "USER")).willReturn(newRt);

        TokenResponseDto result = service.refresh(new RefreshRequestDto("refresh_token"));

        assertThat(result.accessToken()).isEqualTo("new_access");
        assertThat(storedToken.getRevoked()).isTrue();
    }

    @Test
    void refresh_throwsException_whenTokenRevoked() {
        Claims claims = org.mockito.Mockito.mock(Claims.class);
        given(claims.getId()).willReturn("jti-revoked");
        given(claims.get("typ", String.class)).willReturn("refresh");

        RefreshToken revoked = RefreshToken.builder()
                .jti("jti-revoked")
                .authId(1L)
                .expiresAt(Instant.now().plusSeconds(3600).toEpochMilli())
                .revoked(true)
                .build();

        given(jwtTokenManager.parse("bad_token")).willReturn(Optional.of(claims));
        given(refreshTokenRepository.findByJti("jti-revoked")).willReturn(Optional.of(revoked));

        assertThatThrownBy(() -> service.refresh(new RefreshRequestDto("bad_token")))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void logout_revokesToken_whenValid() {
        RefreshToken token = RefreshToken.builder()
                .jti("jti-1")
                .authId(1L)
                .revoked(false)
                .build();

        given(jwtTokenManager.extractJti("refresh_token")).willReturn(Optional.of("jti-1"));
        given(refreshTokenRepository.findByJti("jti-1")).willReturn(Optional.of(token));
        given(refreshTokenRepository.save(any())).willReturn(null);

        service.logout(new RefreshRequestDto("refresh_token"));

        assertThat(token.getRevoked()).isTrue();
        then(refreshTokenRepository).should().save(token);
    }

    @Test
    void logout_doesNothing_whenTokenNotFound() {
        given(jwtTokenManager.extractJti("unknown")).willReturn(Optional.empty());
        service.logout(new RefreshRequestDto("unknown"));
        then(refreshTokenRepository).shouldHaveNoInteractions();
    }

    // helper
    private Auth buildAuth(Long id, String userName, String email, Role role) {
        Auth auth = Auth.builder()
                .userName(userName)
                .email(email)
                .password("encoded_pass")
                .role(role)
                .build();
        auth.setId(id);
        return auth;
    }
}
