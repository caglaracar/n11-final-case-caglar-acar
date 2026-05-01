package com.caglar.auth.service.impl;

import com.caglar.auth.config.AuthProperties;
import com.caglar.auth.dto.request.LoginRequestDto;
import com.caglar.auth.dto.request.RefreshRequestDto;
import com.caglar.auth.dto.request.RegisterAdminRequestDto;
import com.caglar.auth.dto.request.RegisterRequestDto;
import com.caglar.auth.dto.response.AuthInfoResponseDto;
import com.caglar.auth.dto.response.RegisterResponseDto;
import com.caglar.auth.dto.response.TokenResponseDto;
import com.caglar.auth.entity.Auth;
import com.caglar.auth.entity.RefreshToken;
import com.caglar.auth.enums.Role;
import com.caglar.auth.client.UserServiceClient;
import com.caglar.auth.mapper.AuthMapper;
import com.caglar.auth.repository.AuthRepository;
import com.caglar.auth.repository.RefreshTokenRepository;
import com.caglar.auth.service.AuthService;
import com.caglar.auth.validator.AuthValidator;
import com.caglar.common.exception.BusinessException;
import com.caglar.common.exception.ErrorType;
import com.caglar.common.security.JwtTokenManager;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthServiceImpl implements AuthService {

    private static final String CLAIM_TYP = "typ";
    private static final String TYP_REFRESH = "refresh";

    private final AuthRepository authRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthValidator authValidator;
    private final JwtTokenManager jwtTokenManager;
    private final UserServiceClient userServiceClient;
    private final AuthProperties.Jwt jwtProperties;

    @Override
    @Transactional
    public RegisterResponseDto register(RegisterRequestDto dto) {
        return doRegister(dto.userName(), dto.email(), dto.password(), dto.repassword(), Role.USER);
    }

    @Override
    @Transactional
    public RegisterResponseDto registerAdmin(RegisterAdminRequestDto dto) {
        authValidator.validateAdminInvite(dto.inviteCode());
        return doRegister(dto.userName(), dto.email(), dto.password(), dto.repassword(), Role.ADMIN);
    }

    @Override
    public AuthInfoResponseDto getByAuthId(Long authId) {
        return AuthMapper.toAuthInfoResponse(requireAuth(authId));
    }

    @Override
    @Transactional
    public TokenResponseDto login(LoginRequestDto dto) {
        Auth auth = resolveByIdentifier(dto.userName());
        if (!passwordEncoder.matches(dto.password(), auth.getPassword())) {
            throw new BusinessException(ErrorType.INVALID_CREDENTIALS);
        }
        return issueTokens(auth);
    }

    @Override
    @Transactional
    public TokenResponseDto refresh(RefreshRequestDto dto) {
        Claims claims = parseRefreshClaims(dto.refreshToken());
        RefreshToken stored = loadActiveRefreshToken(claims.getId());
        stored.setRevoked(true);
        refreshTokenRepository.save(stored);
        return issueTokens(requireAuth(stored.getAuthId()));
    }

    @Override
    @Transactional
    public void logout(RefreshRequestDto dto) {
        jwtTokenManager.extractJti(dto.refreshToken())
                .flatMap(refreshTokenRepository::findByJti)
                .ifPresent(token -> {
                    token.setRevoked(true);
                    refreshTokenRepository.save(token);
                });
    }

    private RegisterResponseDto doRegister(String userName, String email, String password, String repassword, Role role) {
        authValidator.validatePasswordsMatch(password, repassword);
        if (authRepository.existsByUserName(userName)) {
            throw new BusinessException(ErrorType.USER_ALREADY_EXISTS, "Bu kullanıcı adı kullanılıyor");
        }
        if (authRepository.existsByEmail(email)) {
            throw new BusinessException(ErrorType.USER_ALREADY_EXISTS, "Bu e-posta kullanılıyor");
        }
        Auth auth = authRepository.save(Auth.builder()
                .userName(userName)
                .email(email)
                .password(passwordEncoder.encode(password))
                .role(role)
                .build());
        notifyUserProfileCreated(auth);
        return AuthMapper.toRegisterResponse(auth);
    }

    private Auth requireAuth(Long authId) {
        return authRepository.findById(authId)
                .orElseThrow(() -> new BusinessException(ErrorType.USER_NOT_FOUND));
    }

    private Auth resolveByIdentifier(String identifier) {
        boolean looksLikeEmail = identifier.contains("@");
        return (looksLikeEmail ? authRepository.findByEmail(identifier) : authRepository.findByUserName(identifier))
                .or(() -> looksLikeEmail ? authRepository.findByUserName(identifier)
                                         : authRepository.findByEmail(identifier))
                .orElseThrow(() -> new BusinessException(ErrorType.INVALID_CREDENTIALS));
    }

    private Claims parseRefreshClaims(String token) {
        Claims claims = jwtTokenManager.parse(token)
                .orElseThrow(() -> new BusinessException(ErrorType.INVALID_TOKEN));
        if (!TYP_REFRESH.equals(claims.get(CLAIM_TYP, String.class))) {
            throw new BusinessException(ErrorType.INVALID_TOKEN);
        }
        return claims;
    }

    private RefreshToken loadActiveRefreshToken(String jti) {
        RefreshToken stored = refreshTokenRepository.findByJti(jti)
                .orElseThrow(() -> new BusinessException(ErrorType.INVALID_TOKEN));
        if (Boolean.TRUE.equals(stored.getRevoked())) {
            throw new BusinessException(ErrorType.REFRESH_TOKEN_REVOKED);
        }
        if (stored.getExpiresAt() < Instant.now().toEpochMilli()) {
            throw new BusinessException(ErrorType.INVALID_TOKEN, "Refresh token süresi dolmuş");
        }
        return stored;
    }

    private TokenResponseDto issueTokens(Auth auth) {
        String access = jwtTokenManager.createAccessToken(auth.getId(), auth.getRole().name());
        JwtTokenManager.RefreshToken refresh = jwtTokenManager.createRefreshToken(auth.getId(), auth.getRole().name());
        refreshTokenRepository.save(AuthMapper.toRefreshToken(auth.getId(), refresh));
        return TokenResponseDto.of(access, refresh.token(), jwtProperties.accessTtlSeconds());
    }

    private void notifyUserProfileCreated(Auth auth) {
        try {
            userServiceClient.create(AuthMapper.toCreateUserRequest(auth));
        } catch (Exception e) {
            log.warn("user-service createUser çağrısı başarısız: {}", e.getMessage());
        }
    }
}
