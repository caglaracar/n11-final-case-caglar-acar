package com.caglar.product.controller;

import com.caglar.common.dto.BaseResponse;
import com.caglar.product.dto.request.CreateBlogPostRequestDto;
import com.caglar.product.dto.response.BlogPostResponseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

@Tag(name = "Blog", description = "Blog yazıları")
public interface IBlogApi {

    @Operation(summary = "Yazı oluştur — ADMIN")
    ResponseEntity<BaseResponse<BlogPostResponseDto>> create(@Valid @RequestBody CreateBlogPostRequestDto dto);

    @Operation(summary = "Yayınlanmış yazıları listele")
    ResponseEntity<BaseResponse<Page<BlogPostResponseDto>>> getList(Pageable pageable);

    @Operation(summary = "Yazıyı id ile getir")
    ResponseEntity<BaseResponse<BlogPostResponseDto>> getById(@PathVariable String id);

    @Operation(summary = "Yazıyı slug ile getir")
    ResponseEntity<BaseResponse<BlogPostResponseDto>> getBySlug(@PathVariable String slug);

    @Operation(summary = "Yazı sil — ADMIN")
    ResponseEntity<BaseResponse<Void>> remove(@PathVariable String id);
}
