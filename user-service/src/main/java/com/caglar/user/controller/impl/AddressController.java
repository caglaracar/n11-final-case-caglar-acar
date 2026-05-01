package com.caglar.user.controller.impl;

import com.caglar.user.controller.IAddressApi;
import com.caglar.common.controller.BaseController;
import com.caglar.common.dto.BaseResponse;
import com.caglar.user.dto.request.AddressRequestDto;
import com.caglar.user.dto.response.AddressResponseDto;
import com.caglar.user.service.AddressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import static com.caglar.common.constant.RestApis.ADDRESS;
import static com.caglar.common.constant.RestApis.CREATE;
import static com.caglar.common.constant.RestApis.DELETE;
import static com.caglar.common.constant.RestApis.UPDATE;

@RestController
@RequestMapping(ADDRESS)
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class AddressController extends BaseController implements IAddressApi {

    private final AddressService addressService;

    @Override
    @GetMapping
    public ResponseEntity<BaseResponse<List<AddressResponseDto>>> getList(
            @RequestHeader("X-User-Id") Long authId) {
        return ok(addressService.getList(authId));
    }

    @Override
    @PostMapping(CREATE)
    public ResponseEntity<BaseResponse<AddressResponseDto>> create(
            @RequestHeader("X-User-Id") Long authId,
            @Valid @RequestBody AddressRequestDto dto) {
        return created(addressService.create(authId, dto));
    }

    @Override
    @PutMapping(UPDATE + "/{id}")
    public ResponseEntity<BaseResponse<AddressResponseDto>> update(
            @RequestHeader("X-User-Id") Long authId,
            @PathVariable String id,
            @Valid @RequestBody AddressRequestDto dto) {
        return ok(addressService.update(authId, id, dto));
    }

    @Override
    @DeleteMapping(DELETE + "/{id}")
    public ResponseEntity<BaseResponse<Void>> remove(
            @RequestHeader("X-User-Id") Long authId,
            @PathVariable String id) {
        addressService.remove(authId, id);
        return ok();
    }

    @Override
    @PostMapping("/default/{id}")
    public ResponseEntity<BaseResponse<AddressResponseDto>> setDefault(
            @RequestHeader("X-User-Id") Long authId,
            @PathVariable String id) {
        return ok(addressService.setDefault(authId, id));
    }
}
