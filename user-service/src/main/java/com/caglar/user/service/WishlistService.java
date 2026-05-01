package com.caglar.user.service;

import com.caglar.user.dto.response.AdminWishlistEntryDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface WishlistService {
    List<String> getList(Long authId);
    List<String> add(Long authId, String productId);
    List<String> remove(Long authId, String productId);
    void clear(Long authId);

    /** Admin paneli — tüm kullanıcıların wishlist özetlerini sayfalı döner. */
    Page<AdminWishlistEntryDto> adminListAll(Pageable pageable);
}
