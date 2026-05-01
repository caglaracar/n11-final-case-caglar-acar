package com.caglar.user.controller;

import com.caglar.common.dto.BaseResponse;
import com.caglar.user.dto.request.AddressRequestDto;
import com.caglar.user.dto.response.AddressResponseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.List;

@Tag(name = "Address", description = "Kullanıcı adres işlemleri")
public interface IAddressApi {

    @Operation(summary = "Tüm adresleri listele")
    ResponseEntity<BaseResponse<List<AddressResponseDto>>> getList(
            @RequestHeader("X-User-Id") Long authId);

    @Operation(summary = "Yeni adres oluştur")
    ResponseEntity<BaseResponse<AddressResponseDto>> create(
            @RequestHeader("X-User-Id") Long authId,
            @Valid @RequestBody AddressRequestDto dto);

    @Operation(summary = "Adres güncelle (partial)")
    ResponseEntity<BaseResponse<AddressResponseDto>> update(
            @RequestHeader("X-User-Id") Long authId,
            @PathVariable String id,
            @Valid @RequestBody AddressRequestDto dto);

    @Operation(summary = "Adres sil")
    ResponseEntity<BaseResponse<Void>> remove(
            @RequestHeader("X-User-Id") Long authId,
            @PathVariable String id);

    @Operation(summary = "Varsayılan adresi seç")
    ResponseEntity<BaseResponse<AddressResponseDto>> setDefault(
            @RequestHeader("X-User-Id") Long authId,
            @PathVariable String id);
}
