package com.caglar.product.service.impl;

import com.caglar.common.exception.BusinessException;
import com.caglar.common.exception.ErrorType;
import com.caglar.common.util.Sorts;
import com.caglar.product.entity.Category;
import com.caglar.product.dto.request.CreateCategoryRequestDto;
import com.caglar.product.dto.request.UpdateCategoryRequestDto;
import com.caglar.product.dto.response.CategoryResponseDto;
import com.caglar.product.mapper.ProductMapper;
import com.caglar.product.repository.CategoryRepository;
import com.caglar.product.repository.ProductRepository;
import com.caglar.product.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional
    public CategoryResponseDto create(CreateCategoryRequestDto dto) {
        if (categoryRepository.existsByName(dto.name())) {
            throw new BusinessException(ErrorType.INVALID_ARGUMENT, "Bu kategori zaten var");
        }
        Category saved = categoryRepository.save(ProductMapper.fromCreateRequest(dto));
        return ProductMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public CategoryResponseDto update(String id, UpdateCategoryRequestDto dto) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorType.NOT_FOUND, "Kategori bulunamadı"));
        category.merge(dto.name(), dto.description(), dto.slug(), dto.iconClass(),
                dto.highlightLabel(), dto.visibleInNav(), dto.sortOrder());
        return ProductMapper.toResponse(categoryRepository.save(category));
    }

    @Override
    @Transactional
    public void remove(String id) {
        if (!categoryRepository.existsById(id)) {
            throw new BusinessException(ErrorType.NOT_FOUND, "Kategori bulunamadı");
        }
        if (productRepository.existsByCategoryId(id)) {
            throw new BusinessException(ErrorType.INVALID_ARGUMENT,
                    "Bu kategoriye bağlı ürünler var. Önce ürünleri taşıyın veya silin.");
        }
        categoryRepository.deleteById(id);
    }

    @Override
    public List<CategoryResponseDto> getList() {
        return categoryRepository.findAll(Sorts.SORT_ORDER_THEN_NAME).stream().map(ProductMapper::toResponse).toList();
    }
}
