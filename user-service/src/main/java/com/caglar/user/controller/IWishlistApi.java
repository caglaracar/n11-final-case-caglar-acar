package com.caglar.user.controller;

import com.caglar.common.dto.BaseResponse;
import com.caglar.user.dto.response.AdminWishlistEntryDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.List;

@Tag(name = "Wishlist", description = "Kullanıcı favori ürün listesi")
public interface IWishlistApi {

    @Operation(summary = "Wishlist'i getir")
    ResponseEntity<BaseResponse<List<String>>> getList(@RequestHeader("X-User-Id") Long authId);

    @Operation(summary = "Wishlist'e ürün ekle")
    ResponseEntity<BaseResponse<List<String>>> add(
            @RequestHeader("X-User-Id") Long authId,
            @PathVariable String productId);

    @Operation(summary = "Wishlist'ten ürün çıkar")
    ResponseEntity<BaseResponse<List<String>>> remove(
            @RequestHeader("X-User-Id") Long authId,
            @PathVariable String productId);

    @Operation(summary = "Wishlist'i temizle")
    ResponseEntity<BaseResponse<Void>> clear(@RequestHeader("X-User-Id") Long authId);

    @Operation(summary = "Admin: tüm kullanıcıların wishlist özetlerini sayfalı listele")
    ResponseEntity<BaseResponse<Page<AdminWishlistEntryDto>>> adminListAll(Pageable pageable);
}
