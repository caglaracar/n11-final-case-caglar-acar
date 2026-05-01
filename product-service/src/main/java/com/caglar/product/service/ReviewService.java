package com.caglar.product.service;

import com.caglar.product.dto.request.CreateReviewRequestDto;
import com.caglar.product.dto.response.ReviewResponseDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ReviewService {
    ReviewResponseDto create(Long authorAuthId, String authorName, CreateReviewRequestDto dto);
    Page<ReviewResponseDto> getByProductList(String productId, Pageable pageable);
    /** Admin paneli: tüm yorumlar (paginated, en yeni üstte). */
    Page<ReviewResponseDto> getList(Pageable pageable);
    void remove(String id);
}
