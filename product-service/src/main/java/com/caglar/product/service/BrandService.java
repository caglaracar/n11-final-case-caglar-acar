package com.caglar.product.service;

import com.caglar.product.dto.request.CreateBrandRequestDto;
import com.caglar.product.dto.request.UpdateBrandRequestDto;
import com.caglar.product.dto.response.BrandResponseDto;

import java.util.List;

public interface BrandService {

    BrandResponseDto create(CreateBrandRequestDto dto);

    BrandResponseDto update(String id, UpdateBrandRequestDto dto);

    void remove(String id);

    List<BrandResponseDto> getList();
}
