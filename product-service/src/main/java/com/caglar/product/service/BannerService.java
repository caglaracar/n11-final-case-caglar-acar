package com.caglar.product.service;

import com.caglar.product.dto.request.CreateBannerRequestDto;
import com.caglar.product.dto.request.UpdateBannerRequestDto;
import com.caglar.product.dto.response.BannerResponseDto;

import java.util.List;

public interface BannerService {

    List<BannerResponseDto> getActiveList();

    List<BannerResponseDto> getList();

    BannerResponseDto getById(String id);

    BannerResponseDto create(CreateBannerRequestDto dto);

    BannerResponseDto update(String id, UpdateBannerRequestDto dto);

    void remove(String id);
}
