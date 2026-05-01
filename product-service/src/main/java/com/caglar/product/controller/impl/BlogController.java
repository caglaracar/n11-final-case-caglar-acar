package com.caglar.product.controller.impl;

import com.caglar.common.controller.BaseController;
import com.caglar.common.dto.BaseResponse;
import com.caglar.product.controller.IBlogApi;
import com.caglar.product.dto.request.CreateBlogPostRequestDto;
import com.caglar.product.dto.response.BlogPostResponseDto;
import com.caglar.product.service.BlogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static com.caglar.common.constant.RestApis.BLOG;
import static com.caglar.common.constant.RestApis.CREATE;
import static com.caglar.common.constant.RestApis.DELETE;
import static com.caglar.common.constant.RestApis.FIND_ALL;
import static com.caglar.common.constant.RestApis.FIND_BY_ID;

@RestController
@RequestMapping(BLOG)
@RequiredArgsConstructor
public class BlogController extends BaseController implements IBlogApi {

    private final BlogService blogService;

    @Override
    @PostMapping(CREATE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BaseResponse<BlogPostResponseDto>> create(@Valid @RequestBody CreateBlogPostRequestDto dto) {
        return created(blogService.create(dto));
    }

    @Override
    @GetMapping(FIND_ALL)
    public ResponseEntity<BaseResponse<Page<BlogPostResponseDto>>> getList(Pageable pageable) {
        return ok(blogService.getList(pageable));
    }

    @Override
    @GetMapping(FIND_BY_ID + "/{id}")
    public ResponseEntity<BaseResponse<BlogPostResponseDto>> getById(@PathVariable String id) {
        return ok(blogService.getById(id));
    }

    @Override
    @GetMapping("/slug/{slug}")
    public ResponseEntity<BaseResponse<BlogPostResponseDto>> getBySlug(@PathVariable String slug) {
        return ok(blogService.getBySlug(slug));
    }

    @Override
    @DeleteMapping(DELETE + "/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BaseResponse<Void>> remove(@PathVariable String id) {
        blogService.remove(id);
        return ok();
    }
}
