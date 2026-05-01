package com.caglar.auth.service;

import com.caglar.auth.dto.request.LoginRequestDto;
import com.caglar.auth.dto.request.RefreshRequestDto;
import com.caglar.auth.dto.request.RegisterAdminRequestDto;
import com.caglar.auth.dto.request.RegisterRequestDto;
import com.caglar.auth.dto.response.AuthInfoResponseDto;
import com.caglar.auth.dto.response.RegisterResponseDto;
import com.caglar.auth.dto.response.TokenResponseDto;

public interface AuthService {

    RegisterResponseDto register(RegisterRequestDto dto);

    AuthInfoResponseDto getByAuthId(Long authId);

    RegisterResponseDto registerAdmin(RegisterAdminRequestDto dto);

    TokenResponseDto login(LoginRequestDto dto);

    TokenResponseDto refresh(RefreshRequestDto dto);

    void logout(RefreshRequestDto dto);
}
