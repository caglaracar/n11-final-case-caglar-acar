package com.caglar.auth.controller;

import com.caglar.auth.dto.request.LoginRequestDto;
import com.caglar.auth.dto.request.RefreshRequestDto;
import com.caglar.auth.dto.request.RegisterAdminRequestDto;
import com.caglar.auth.dto.request.RegisterRequestDto;
import com.caglar.auth.dto.response.RegisterResponseDto;
import com.caglar.auth.dto.response.TokenResponseDto;
import com.caglar.common.dto.BaseResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;

import static com.caglar.common.constant.RestApis.LOGIN;
import static com.caglar.common.constant.RestApis.LOGOUT;
import static com.caglar.common.constant.RestApis.REFRESH;
import static com.caglar.common.constant.RestApis.REGISTER;

@Tag(name = "Auth", description = "Kayıt, login, refresh, logout işlemleri")
public interface IAuthApi {

    @Operation(summary = "Yeni kullanıcı kaydı", description = "Auth + UserProfile (user-service) oluşturur.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Kayıt başarılı"),
            @ApiResponse(responseCode = "400", description = "Validation hatası"),
            @ApiResponse(responseCode = "409", description = "Kullanıcı zaten kayıtlı")
    })
    ResponseEntity<BaseResponse<RegisterResponseDto>> register(@Valid @RequestBody RegisterRequestDto dto);

    @Operation(summary = "Admin kayıt", description = "Davet kodu (invite code) gerektirir. Başarılı olursa ADMIN rolüyle Auth oluşturulur.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Admin kaydı başarılı"),
            @ApiResponse(responseCode = "400", description = "Validation hatası"),
            @ApiResponse(responseCode = "403", description = "Davet kodu geçersiz veya admin kayıt kapalı"),
            @ApiResponse(responseCode = "409", description = "Kullanıcı zaten kayıtlı")
    })
    ResponseEntity<BaseResponse<RegisterResponseDto>> registerAdmin(@Valid @RequestBody RegisterAdminRequestDto dto);

    @Operation(summary = "Giriş", description = "Access + refresh JWT döndürür.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Giriş başarılı"),
            @ApiResponse(responseCode = "401", description = "Geçersiz kimlik bilgileri")
    })
    ResponseEntity<BaseResponse<TokenResponseDto>> login(@Valid @RequestBody LoginRequestDto dto);

    @Operation(summary = "Refresh token rotation", description = "Eski refresh'i revoke eder, yeni access+refresh çifti üretir.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Token yenilendi"),
            @ApiResponse(responseCode = "401", description = "Refresh token geçersiz")
    })
    ResponseEntity<BaseResponse<TokenResponseDto>> refresh(@Valid @RequestBody RefreshRequestDto dto);

    @Operation(summary = "Logout", description = "Refresh token revoke edilir.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Çıkış yapıldı")
    })
    ResponseEntity<BaseResponse<Void>> logout(@Valid @RequestBody RefreshRequestDto dto);
}
