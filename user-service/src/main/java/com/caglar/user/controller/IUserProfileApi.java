package com.caglar.user.controller;

import com.caglar.common.dto.BaseResponse;
import com.caglar.user.dto.request.CreateUserRequestDto;
import com.caglar.user.dto.request.UpdateUserProfileRequestDto;
import com.caglar.user.dto.response.UserProfileResponseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;

@Tag(name = "UserProfile", description = "Kullanıcı profili işlemleri")
public interface IUserProfileApi {

    @Operation(summary = "Profil oluştur (auth-service tarafından çağrılır)")
    @ApiResponses(@ApiResponse(responseCode = "201", description = "Oluşturuldu"))
    ResponseEntity<BaseResponse<Boolean>> create(@Valid @RequestBody CreateUserRequestDto dto);

    @Operation(summary = "Mevcut kullanıcı profilini getir")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Bulundu"),
            @ApiResponse(responseCode = "404", description = "Profil bulunamadı")
    })
    ResponseEntity<BaseResponse<UserProfileResponseDto>> me(@RequestHeader("X-User-Id") Long authId);

    @Operation(summary = "Profil güncelle")
    ResponseEntity<BaseResponse<UserProfileResponseDto>> update(
            @RequestHeader("X-User-Id") Long authId,
            @Valid @RequestBody UpdateUserProfileRequestDto dto);

    @Operation(summary = "Sayfalı kullanıcı arama (userName / email)")
    ResponseEntity<BaseResponse<Page<UserProfileResponseDto>>> search(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String role,
            Pageable pageable);
}
