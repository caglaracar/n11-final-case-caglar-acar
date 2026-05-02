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
import static org.mockito.Mockito.mock;

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

    // ─── Register ────────────────────────────────────────────────

    @Test
    void register_savesUserWithEncodedPasswordAndReturnsDto() {
        willDoNothing().given(authValidator).validatePasswordsMatch(anyString(), anyString());
        given(authRepository.existsByUserName("caglar")).willReturn(false);
        given(authRepository.existsByEmail("caglar@mail.com")).willReturn(false);
        given(passwordEncoder.encode("pass123")).willReturn("$2a$encoded");
        given(authRepository.save(any())).willReturn(buildAuth(1L, "caglar", "caglar@mail.com", Role.USER));

        RegisterResponseDto result = service.register(
                new RegisterRequestDto("caglar", "pass123", "pass123", "caglar@mail.com"));

        assertThat(result.userName()).isEqualTo("caglar");
        assertThat(result.role()).isEqualTo("USER");
        then(authRepository).should().save(any());
    }

    @Test
    void register_throwsException_whenUsernameAlreadyTaken() {
        willDoNothing().given(authValidator).validatePasswordsMatch(anyString(), anyString());
        given(authRepository.existsByUserName("taken")).willReturn(true);

        assertThatThrownBy(() -> service.register(
                new RegisterRequestDto("taken", "p", "p", "new@mail.com")))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("kullanılıyor");
    }

    @Test
    void register_throwsException_whenEmailAlreadyRegistered() {
        willDoNothing().given(authValidator).validatePasswordsMatch(anyString(), anyString());
        given(authRepository.existsByUserName("newuser")).willReturn(false);
        given(authRepository.existsByEmail("taken@mail.com")).willReturn(true);

        assertThatThrownBy(() -> service.register(
                new RegisterRequestDto("newuser", "p", "p", "taken@mail.com")))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("kullanılıyor");
    }

    // ─── Login ───────────────────────────────────────────────────

    @Test
    void login_withUsername_returnsAccessAndRefreshTokens() {
        Auth auth = buildAuth(1L, "caglar", "caglar@mail.com", Role.USER);
        given(authRepository.findByUserName("caglar")).willReturn(Optional.of(auth));
        given(passwordEncoder.matches("pass", "encoded_pass")).willReturn(true);
        given(jwtProperties.accessTtlSeconds()).willReturn(900L);
        given(jwtTokenManager.createAccessToken(1L, "USER")).willReturn("access.token");
        given(jwtTokenManager.createRefreshToken(1L, "USER"))
                .willReturn(new JwtTokenManager.RefreshToken("refresh.token", "jti-1",
                        Instant.now().plusSeconds(86400).toEpochMilli()));
        given(refreshTokenRepository.save(any())).willReturn(null);

        TokenResponseDto result = service.login(new LoginRequestDto("caglar", "pass"));

        assertThat(result.accessToken()).isEqualTo("access.token");
        assertThat(result.refreshToken()).isEqualTo("refresh.token");
        assertThat(result.expiresIn()).isEqualTo(900L);
    }

    @Test
    void login_withEmail_resolvesByEmailFallback() {
        Auth auth = buildAuth(2L, "user2", "user2@mail.com", Role.USER);
        // @ işareti → önce e-posta ile arama
        given(authRepository.findByEmail("user2@mail.com")).willReturn(Optional.of(auth));
        given(passwordEncoder.matches("pass", "encoded_pass")).willReturn(true);
        given(jwtProperties.accessTtlSeconds()).willReturn(900L);
        given(jwtTokenManager.createAccessToken(2L, "USER")).willReturn("access.token");
        given(jwtTokenManager.createRefreshToken(2L, "USER"))
                .willReturn(new JwtTokenManager.RefreshToken("refresh.token", "jti-2",
                        Instant.now().plusSeconds(86400).toEpochMilli()));
        given(refreshTokenRepository.save(any())).willReturn(null);

        TokenResponseDto result = service.login(new LoginRequestDto("user2@mail.com", "pass"));

        assertThat(result.accessToken()).isNotBlank();
    }

    @Test
    void login_throwsException_whenPasswordIsWrong() {
        Auth auth = buildAuth(1L, "caglar", "caglar@mail.com", Role.USER);
        given(authRepository.findByUserName("caglar")).willReturn(Optional.of(auth));
        given(passwordEncoder.matches("wrong", "encoded_pass")).willReturn(false);

        assertThatThrownBy(() -> service.login(new LoginRequestDto("caglar", "wrong")))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void login_throwsException_whenUserDoesNotExist() {
        given(authRepository.findByUserName("ghost")).willReturn(Optional.empty());
        given(authRepository.findByEmail("ghost")).willReturn(Optional.empty());

        assertThatThrownBy(() -> service.login(new LoginRequestDto("ghost", "pass")))
                .isInstanceOf(BusinessException.class);
    }

    // ─── Refresh ─────────────────────────────────────────────────

    @Test
    void refresh_revokesOldTokenAndIssuesNewPair() {
        Claims claims = mock(Claims.class);
        given(claims.getId()).willReturn("jti-old");
        given(claims.get("typ", String.class)).willReturn("refresh");

        RefreshToken stored = refreshToken("jti-old", 1L, false,
                Instant.now().plusSeconds(3600).toEpochMilli());
        Auth auth = buildAuth(1L, "caglar", "caglar@mail.com", Role.USER);

        given(jwtTokenManager.parse("old.refresh.token")).willReturn(Optional.of(claims));
        given(refreshTokenRepository.findByJti("jti-old")).willReturn(Optional.of(stored));
        given(refreshTokenRepository.save(any())).willReturn(null);
        given(authRepository.findById(1L)).willReturn(Optional.of(auth));
        given(jwtProperties.accessTtlSeconds()).willReturn(900L);
        given(jwtTokenManager.createAccessToken(1L, "USER")).willReturn("new.access.token");
        given(jwtTokenManager.createRefreshToken(1L, "USER"))
                .willReturn(new JwtTokenManager.RefreshToken("new.refresh.token", "jti-new",
                        Instant.now().plusSeconds(86400).toEpochMilli()));

        TokenResponseDto result = service.refresh(new RefreshRequestDto("old.refresh.token"));

        assertThat(result.accessToken()).isEqualTo("new.access.token");
        assertThat(stored.getRevoked()).isTrue(); // eski token iptal edilmeli
    }

    @Test
    void refresh_throwsException_whenTokenAlreadyRevoked() {
        Claims claims = mock(Claims.class);
        given(claims.getId()).willReturn("jti-revoked");
        given(claims.get("typ", String.class)).willReturn("refresh");

        RefreshToken revoked = refreshToken("jti-revoked", 1L, true,
                Instant.now().plusSeconds(3600).toEpochMilli());

        given(jwtTokenManager.parse("revoked.token")).willReturn(Optional.of(claims));
        given(refreshTokenRepository.findByJti("jti-revoked")).willReturn(Optional.of(revoked));

        assertThatThrownBy(() -> service.refresh(new RefreshRequestDto("revoked.token")))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void refresh_throwsException_whenTokenExpired() {
        Claims claims = mock(Claims.class);
        given(claims.getId()).willReturn("jti-expired");
        given(claims.get("typ", String.class)).willReturn("refresh");

        // Süresi geçmiş token (expiresAt geçmişte)
        RefreshToken expired = refreshToken("jti-expired", 1L, false,
                Instant.now().minusSeconds(60).toEpochMilli());

        given(jwtTokenManager.parse("expired.token")).willReturn(Optional.of(claims));
        given(refreshTokenRepository.findByJti("jti-expired")).willReturn(Optional.of(expired));

        assertThatThrownBy(() -> service.refresh(new RefreshRequestDto("expired.token")))
                .isInstanceOf(BusinessException.class);
    }

    // ─── Logout ──────────────────────────────────────────────────

    @Test
    void logout_revokesRefreshToken() {
        RefreshToken token = refreshToken("jti-1", 1L, false,
                Instant.now().plusSeconds(86400).toEpochMilli());

        given(jwtTokenManager.extractJti("refresh.token")).willReturn(Optional.of("jti-1"));
        given(refreshTokenRepository.findByJti("jti-1")).willReturn(Optional.of(token));
        given(refreshTokenRepository.save(any())).willReturn(null);

        service.logout(new RefreshRequestDto("refresh.token"));

        assertThat(token.getRevoked()).isTrue();
        then(refreshTokenRepository).should().save(token);
    }

    @Test
    void logout_doesNothing_whenTokenNotFoundInStore() {
        given(jwtTokenManager.extractJti("unknown.token")).willReturn(Optional.empty());

        service.logout(new RefreshRequestDto("unknown.token"));

        then(refreshTokenRepository).shouldHaveNoInteractions();
    }

    // ─── Helpers ─────────────────────────────────────────────────

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

    private RefreshToken refreshToken(String jti, Long authId, boolean revoked, long expiresAt) {
        return RefreshToken.builder()
                .jti(jti)
                .authId(authId)
                .revoked(revoked)
                .expiresAt(expiresAt)
                .build();
    }
}
