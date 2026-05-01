package com.caglar.product.service.impl;

import com.caglar.common.exception.BusinessException;
import com.caglar.common.exception.ErrorType;
import com.caglar.product.entity.BlogPost;
import com.caglar.product.dto.request.CreateBlogPostRequestDto;
import com.caglar.product.dto.response.BlogPostResponseDto;
import com.caglar.product.mapper.BlogMapper;
import com.caglar.product.repository.BlogPostRepository;
import com.caglar.product.service.BlogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BlogServiceImpl implements BlogService {

    private final BlogPostRepository blogPostRepository;

    @Override
    @Transactional
    public BlogPostResponseDto create(CreateBlogPostRequestDto dto) {
        if (blogPostRepository.findBySlug(dto.slug()).isPresent()) {
            throw new BusinessException(ErrorType.INVALID_ARGUMENT, "Bu slug zaten var");
        }
        BlogPost saved = blogPostRepository.save(BlogMapper.fromCreateRequest(dto));
        return BlogMapper.toResponse(saved);
    }

    @Override
    public BlogPostResponseDto getBySlug(String slug) {
        BlogPost post = blogPostRepository.findBySlug(slug)
                .orElseThrow(() -> new BusinessException(ErrorType.NOT_FOUND, "Yazı bulunamadı"));
        return BlogMapper.toResponse(post);
    }

    @Override
    public BlogPostResponseDto getById(String id) {
        BlogPost post = blogPostRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorType.NOT_FOUND, "Yazı bulunamadı"));
        return BlogMapper.toResponse(post);
    }

    @Override
    public Page<BlogPostResponseDto> getList(Pageable pageable) {
        return blogPostRepository.findByPublishedTrue(pageable).map(BlogMapper::toResponse);
    }

    @Override
    @Transactional
    public void remove(String id) {
        if (!blogPostRepository.existsById(id)) {
            throw new BusinessException(ErrorType.NOT_FOUND, "Yazı bulunamadı");
        }
        blogPostRepository.deleteById(id);
    }
}
