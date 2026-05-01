package com.caglar.product.controller.impl;

import com.caglar.common.controller.BaseController;
import com.caglar.common.dto.BaseResponse;
import com.caglar.product.controller.IReviewApi;
import com.caglar.product.dto.request.CreateReviewRequestDto;
import com.caglar.product.dto.response.ReviewResponseDto;
import com.caglar.product.service.ReviewService;
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
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static com.caglar.common.constant.RestApis.CREATE;
import static com.caglar.common.constant.RestApis.DELETE;
import static com.caglar.common.constant.RestApis.FIND_ALL;
import static com.caglar.common.constant.RestApis.REVIEW;

@RestController
@RequestMapping(REVIEW)
@RequiredArgsConstructor
public class ReviewController extends BaseController implements IReviewApi {

    private final ReviewService reviewService;

    @Override
    @PostMapping(CREATE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BaseResponse<ReviewResponseDto>> create(
            @RequestHeader("X-User-Id") Long authId,
            @RequestHeader(value = "X-User-Name", required = false) String userName,
            @Valid @RequestBody CreateReviewRequestDto dto) {
        return created(reviewService.create(authId, userName, dto));
    }

    @Override
    @GetMapping("/product/{productId}")
    public ResponseEntity<BaseResponse<Page<ReviewResponseDto>>> getByProductList(
            @PathVariable String productId, Pageable pageable) {
        return ok(reviewService.getByProductList(productId, pageable));
    }

    @Override
    @GetMapping("/admin" + FIND_ALL)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BaseResponse<Page<ReviewResponseDto>>> getList(Pageable pageable) {
        return ok(reviewService.getList(pageable));
    }

    @Override
    @DeleteMapping(DELETE + "/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BaseResponse<Void>> remove(@PathVariable String id) {
        reviewService.remove(id);
        return ok();
    }
}
