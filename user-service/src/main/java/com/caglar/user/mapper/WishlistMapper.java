package com.caglar.user.mapper;

import com.caglar.user.entity.UserProfile;
import com.caglar.user.dto.response.AdminWishlistEntryDto;

import java.util.List;

public final class WishlistMapper {

    private WishlistMapper() {}

    public static AdminWishlistEntryDto toAdminEntry(UserProfile up) {
        List<String> ids = up.getWishlistProductIds() == null ? List.of() : up.getWishlistProductIds();
        return AdminWishlistEntryDto.builder()
                .authId(up.getAuthId())
                .userName(up.getUserName())
                .email(up.getEmail())
                .itemCount(ids.size())
                .productIds(ids)
                .build();
    }
}
