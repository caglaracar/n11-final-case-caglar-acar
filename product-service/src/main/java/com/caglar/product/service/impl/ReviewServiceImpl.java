package com.caglar.product.service.impl;

import com.caglar.common.exception.BusinessException;
import com.caglar.common.exception.ErrorType;
import com.caglar.product.entity.Product;
import com.caglar.product.entity.Review;
import com.caglar.product.dto.request.CreateReviewRequestDto;
import com.caglar.product.dto.response.ReviewResponseDto;
import com.caglar.product.mapper.ReviewMapper;
import com.caglar.product.repository.ProductRepository;
import com.caglar.product.repository.ReviewRepository;
import com.caglar.product.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional
    public ReviewResponseDto create(Long authorAuthId, String authorName, CreateReviewRequestDto dto) {
        if (authorAuthId == null) {
            throw new BusinessException(ErrorType.UNAUTHORIZED);
        }
        if (!productRepository.existsById(dto.productId())) {
            throw new BusinessException(ErrorType.NOT_FOUND, "Ürün bulunamadı");
        }
        if (reviewRepository.existsByProductIdAndAuthorAuthId(dto.productId(), authorAuthId)) {
            throw new BusinessException(ErrorType.INVALID_ARGUMENT, "Bu ürüne zaten yorum yapmışsın");
        }
        Review saved = reviewRepository.save(ReviewMapper.fromCreateRequest(authorAuthId, authorName, dto));
        recalcProductRating(dto.productId());
        return ReviewMapper.toResponse(saved);
    }

    @Override
    public Page<ReviewResponseDto> getByProductList(String productId, Pageable pageable) {
        return reviewRepository.findByProductId(productId, pageable).map(ReviewMapper::toResponse);
    }

    @Override
    public Page<ReviewResponseDto> getList(Pageable pageable) {
        return reviewRepository.findAll(pageable).map(ReviewMapper::toResponse);
    }

    @Override
    @Transactional
    public void remove(String id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorType.NOT_FOUND, "Yorum bulunamadı"));
        reviewRepository.deleteById(id);
        recalcProductRating(review.getProductId());
    }

    /** İlgili ürünün rating ve reviewCount alanlarını yorumlardan yeniden hesaplayıp persist eder. */
    private void recalcProductRating(String productId) {
        List<Review> all = reviewRepository.findByProductId(productId);
        productRepository.findById(productId).ifPresent(product -> {
            applyAggregate(product, all);
            productRepository.save(product);
        });
    }

    private static void applyAggregate(Product product, List<Review> reviews) {
        if (reviews.isEmpty()) {
            product.setRating(0d);
            product.setReviewCount(0);
            return;
        }
        double avg = reviews.stream().mapToInt(Review::getRating).average().orElse(0);
        product.setRating(Math.round(avg * 10.0) / 10.0);
        product.setReviewCount(reviews.size());
    }
}
