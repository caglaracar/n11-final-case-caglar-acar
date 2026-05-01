package com.caglar.product.service;

import com.caglar.product.dto.request.CreateBlogPostRequestDto;
import com.caglar.product.dto.response.BlogPostResponseDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface BlogService {
    BlogPostResponseDto create(CreateBlogPostRequestDto dto);
    BlogPostResponseDto getBySlug(String slug);
    BlogPostResponseDto getById(String id);
    Page<BlogPostResponseDto> getList(Pageable pageable);
    void remove(String id);
}
