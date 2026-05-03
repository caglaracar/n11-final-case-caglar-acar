package com.caglar.product.service.impl;

import com.caglar.common.exception.BusinessException;
import com.caglar.common.exception.ErrorType;
import com.caglar.product.dto.request.CreateProductRequestDto;
import com.caglar.product.dto.request.ProductSearchFilter;
import com.caglar.product.dto.request.UpdateProductRequestDto;
import com.caglar.product.dto.response.ProductResponseDto;
import com.caglar.product.entity.Product;
import com.caglar.product.helper.SearchStatsRecorder;
import com.caglar.product.mapper.ProductMapper;
import com.caglar.product.repository.BrandRepository;
import com.caglar.product.repository.CategoryRepository;
import com.caglar.product.repository.ProductRepository;
import com.caglar.product.service.ProductService;
import com.caglar.product.service.SearchStatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final SearchStatsService searchStatsService;
    private final SearchStatsRecorder searchStatsRecorder;

    @Override
    @Transactional
    public ProductResponseDto create(CreateProductRequestDto dto, Long sellerAuthId) {
        if (!categoryRepository.existsById(dto.categoryId())) {
            throw new BusinessException(ErrorType.NOT_FOUND, "Kategori bulunamadı");
        }
        Product saved = productRepository.save(ProductMapper.fromCreateRequest(dto, sellerAuthId));
        return ProductMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public ProductResponseDto update(String productId, UpdateProductRequestDto dto) {
        Product product = requireProduct(productId);
        product.applyUpdate(dto.name(), dto.description(), dto.price(),
                dto.categoryId(), dto.subcategory(), dto.brand(), dto.stock(),
                dto.imageUrl(), dto.images(), dto.badge(), dto.features());
        return ProductMapper.toResponse(productRepository.save(product));
    }

    @Override
    @Transactional
    public void remove(String productId) {
        if (!productRepository.existsById(productId)) {
            throw new BusinessException(ErrorType.NOT_FOUND, "Ürün bulunamadı");
        }
        productRepository.deleteById(productId);
    }

    @Override
    @Transactional
    public ProductResponseDto getById(String productId) {
        Product product = requireProduct(productId);
        product.incrementViewCount();
        searchStatsService.recordProductView(productId);
        return ProductMapper.toResponse(productRepository.save(product));
    }

    @Override
    public Page<ProductResponseDto> getList(String q, String categoryId, String brandId, Pageable pageable) {

        String brandFilter = brandId;
        if (brandId != null && !brandId.isBlank()) {
            brandFilter = brandRepository.findById(brandId)
                    .map(b -> b.getName())
                    .orElse(brandId);
        }
        ProductSearchFilter filter = ProductSearchFilter.of(q, categoryId, brandFilter);
        Page<Product> page = productRepository.search(filter, pageable);
        searchStatsRecorder.recordIfNeeded(filter, page);
        Map<String, Long> hits = searchStatsService.getProductHitsMap(
                page.getContent().stream().map(Product::getId).toList());
        return page.map(product -> ProductMapper.toResponse(product, hits.getOrDefault(product.getId(), 0L)));
    }

    @Override
    @Transactional
    public void updateStock(String productId, int quantity) {
        Product product = requireProduct(productId);
        product.setStock(quantity);
        productRepository.save(product);
    }

    private Product requireProduct(String id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorType.NOT_FOUND, "Ürün bulunamadı"));
    }
}
