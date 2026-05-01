package com.caglar.user.dto.response;

import lombok.Builder;

import java.util.List;

/** Admin paneli için: tek user'ın özet wishlist bilgisi. */
@Builder
public record AdminWishlistEntryDto(
        Long authId,
        String userName,
        String email,
        int itemCount,
        List<String> productIds
) {}
