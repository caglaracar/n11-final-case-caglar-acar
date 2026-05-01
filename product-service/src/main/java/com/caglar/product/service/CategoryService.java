package com.caglar.product.service;

import com.caglar.product.dto.request.CreateCategoryRequestDto;
import com.caglar.product.dto.request.UpdateCategoryRequestDto;
import com.caglar.product.dto.response.CategoryResponseDto;

import java.util.List;

public interface CategoryService {

    CategoryResponseDto create(CreateCategoryRequestDto dto);

    CategoryResponseDto update(String id, UpdateCategoryRequestDto dto);

    void remove(String id);

    List<CategoryResponseDto> getList();
}
