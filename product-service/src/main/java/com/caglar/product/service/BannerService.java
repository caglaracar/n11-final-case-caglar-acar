package com.caglar.product.service;

import com.caglar.product.dto.request.CreateBannerRequestDto;
import com.caglar.product.dto.request.UpdateBannerRequestDto;
import com.caglar.product.dto.response.BannerResponseDto;

import java.util.List;

public interface BannerService {

    /** Sadece aktif banner'lar — public ana sayfa için. */
    List<BannerResponseDto> getActiveList();

    /** Tümü — admin paneli için. */
    List<BannerResponseDto> getList();

    BannerResponseDto getById(String id);

    BannerResponseDto create(CreateBannerRequestDto dto);

    BannerResponseDto update(String id, UpdateBannerRequestDto dto);

    void remove(String id);
}
