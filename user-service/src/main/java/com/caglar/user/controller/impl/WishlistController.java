package com.caglar.user.controller.impl;

import com.caglar.user.controller.IWishlistApi;
import com.caglar.common.controller.BaseController;
import com.caglar.common.dto.BaseResponse;
import com.caglar.user.dto.response.AdminWishlistEntryDto;
import com.caglar.user.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import static com.caglar.common.constant.RestApis.FIND_ALL;
import static com.caglar.common.constant.RestApis.WISHLIST;

@RestController
@RequestMapping(WISHLIST)
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class WishlistController extends BaseController implements IWishlistApi {

    private final WishlistService wishlistService;

    @Override
    @GetMapping
    public ResponseEntity<BaseResponse<List<String>>> getList(@RequestHeader("X-User-Id") Long authId) {
        return ok(wishlistService.getList(authId));
    }

    @Override
    @PostMapping("/add/{productId}")
    public ResponseEntity<BaseResponse<List<String>>> add(
            @RequestHeader("X-User-Id") Long authId,
            @PathVariable String productId) {
        return ok(wishlistService.add(authId, productId));
    }

    @Override
    @DeleteMapping("/remove/{productId}")
    public ResponseEntity<BaseResponse<List<String>>> remove(
            @RequestHeader("X-User-Id") Long authId,
            @PathVariable String productId) {
        return ok(wishlistService.remove(authId, productId));
    }

    @Override
    @DeleteMapping("/clear")
    public ResponseEntity<BaseResponse<Void>> clear(@RequestHeader("X-User-Id") Long authId) {
        wishlistService.clear(authId);
        return ok();
    }

    @Override
    @GetMapping("/admin" + FIND_ALL)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BaseResponse<Page<AdminWishlistEntryDto>>> adminListAll(Pageable pageable) {
        return ok(wishlistService.adminListAll(pageable));
    }
}
