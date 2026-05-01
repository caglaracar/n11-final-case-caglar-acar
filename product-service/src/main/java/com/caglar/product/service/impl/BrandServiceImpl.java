package com.caglar.product.service.impl;

import com.caglar.common.exception.BusinessException;
import com.caglar.common.exception.ErrorType;
import com.caglar.common.util.Sorts;
import com.caglar.product.entity.Brand;
import com.caglar.product.dto.request.CreateBrandRequestDto;
import com.caglar.product.dto.request.UpdateBrandRequestDto;
import com.caglar.product.dto.response.BrandResponseDto;
import com.caglar.product.mapper.ProductMapper;
import com.caglar.product.repository.BrandRepository;
import com.caglar.product.repository.ProductRepository;
import com.caglar.product.service.BrandService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BrandServiceImpl implements BrandService {

    private final BrandRepository brandRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional
    public BrandResponseDto create(CreateBrandRequestDto dto) {
        if (brandRepository.existsByName(dto.name())) {
            throw new BusinessException(ErrorType.INVALID_ARGUMENT, "Bu marka zaten var");
        }
        Brand saved = brandRepository.save(ProductMapper.fromCreateRequest(dto));
        return ProductMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public BrandResponseDto update(String id, UpdateBrandRequestDto dto) {
        Brand brand = requireBrand(id);
        brand.merge(dto.name(), dto.description(), dto.slug(), dto.logoUrl(), dto.active(), dto.sortOrder());
        return ProductMapper.toResponse(brandRepository.save(brand));
    }

    @Override
    @Transactional
    public void remove(String id) {
        Brand brand = requireBrand(id);
        if (productRepository.existsByBrand(brand.getName())) {
            throw new BusinessException(ErrorType.INVALID_ARGUMENT,
                    "Bu markaya bağlı ürünler var. Önce ürünleri taşıyın veya silin.");
        }
        brandRepository.deleteById(id);
    }

    @Override
    public List<BrandResponseDto> getList() {
        return brandRepository.findAll(Sorts.SORT_ORDER_THEN_NAME).stream().map(ProductMapper::toResponse).toList();
    }

    private Brand requireBrand(String id) {
        return brandRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorType.NOT_FOUND, "Marka bulunamadı"));
    }
}
