package com.caglar.user.service.impl;

import com.caglar.common.exception.BusinessException;
import com.caglar.common.exception.ErrorType;
import com.caglar.user.entity.UserProfile;
import com.caglar.user.dto.response.AdminWishlistEntryDto;
import com.caglar.user.mapper.WishlistMapper;
import com.caglar.user.repository.UserProfileRepository;
import com.caglar.user.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WishlistServiceImpl implements WishlistService {

    private final UserProfileRepository userProfileRepository;

    @Override
    public List<String> getList(Long authId) {
        return requireProfile(authId).wishlistOrEmpty();
    }

    @Override
    @Transactional
    public List<String> add(Long authId, String productId) {
        UserProfile profile = requireProfile(authId);
        if (profile.addToWishlist(productId)) {
            userProfileRepository.save(profile);
        }
        return profile.wishlistOrEmpty();
    }

    @Override
    @Transactional
    public List<String> remove(Long authId, String productId) {
        UserProfile profile = requireProfile(authId);
        if (profile.removeFromWishlist(productId)) {
            userProfileRepository.save(profile);
        }
        return profile.wishlistOrEmpty();
    }

    @Override
    @Transactional
    public void clear(Long authId) {
        UserProfile profile = requireProfile(authId);
        profile.clearWishlist();
        userProfileRepository.save(profile);
    }

    @Override
    public Page<AdminWishlistEntryDto> adminListAll(Pageable pageable) {
        return userProfileRepository.findAll(pageable).map(WishlistMapper::toAdminEntry);
    }

    private UserProfile requireProfile(Long authId) {
        return userProfileRepository.findByAuthId(authId)
                .orElseThrow(() -> new BusinessException(ErrorType.USER_NOT_FOUND));
    }
}
