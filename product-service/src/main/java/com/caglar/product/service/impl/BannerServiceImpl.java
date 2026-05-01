package com.caglar.product.service.impl;

import com.caglar.common.exception.BusinessException;
import com.caglar.common.exception.ErrorType;
import com.caglar.common.util.Sorts;
import com.caglar.product.entity.Banner;
import com.caglar.product.dto.request.CreateBannerRequestDto;
import com.caglar.product.dto.request.UpdateBannerRequestDto;
import com.caglar.product.dto.response.BannerResponseDto;
import com.caglar.product.mapper.BannerMapper;
import com.caglar.product.repository.BannerRepository;
import com.caglar.product.service.BannerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BannerServiceImpl implements BannerService {

    private final BannerRepository bannerRepository;

    @Override
    public List<BannerResponseDto> getActiveList() {
        return bannerRepository.findAllByActiveTrue(Sorts.SORT_ORDER_THEN_CREATED_DESC)
                .stream().map(BannerMapper::toResponse).toList();
    }

    @Override
    public List<BannerResponseDto> getList() {
        return bannerRepository.findAll(Sorts.SORT_ORDER_THEN_CREATED_DESC)
                .stream().map(BannerMapper::toResponse).toList();
    }

    @Override
    public BannerResponseDto getById(String id) {
        return BannerMapper.toResponse(requireBanner(id));
    }

    @Override
    @Transactional
    public BannerResponseDto create(CreateBannerRequestDto dto) {
        Banner saved = bannerRepository.save(BannerMapper.fromCreateRequest(dto));
        return BannerMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public BannerResponseDto update(String id, UpdateBannerRequestDto dto) {
        Banner banner = requireBanner(id);
        banner.merge(dto.eyebrow(), dto.title(), dto.subtitle(), dto.ctaLabel(),
                dto.ctaHref(), dto.imageUrl(), dto.badge(), dto.sortOrder(), dto.active());
        return BannerMapper.toResponse(bannerRepository.save(banner));
    }

    @Override
    @Transactional
    public void remove(String id) {
        if (!bannerRepository.existsById(id)) {
            throw new BusinessException(ErrorType.NOT_FOUND, "Banner bulunamadı");
        }
        bannerRepository.deleteById(id);
    }

    private Banner requireBanner(String id) {
        return bannerRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorType.NOT_FOUND, "Banner bulunamadı"));
    }
}
