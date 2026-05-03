package com.caglar.product.controller.impl;

import com.caglar.common.controller.BaseController;
import com.caglar.common.dto.BaseResponse;
import com.caglar.product.controller.IProductApi;
import com.caglar.product.dto.request.CreateProductRequestDto;
import com.caglar.product.dto.request.UpdateProductRequestDto;
import com.caglar.product.dto.response.ProductResponseDto;
import com.caglar.product.service.ProductService;
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
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import static com.caglar.common.constant.RestApis.CREATE;
import static com.caglar.common.constant.RestApis.DELETE;
import static com.caglar.common.constant.RestApis.FIND_ALL;
import static com.caglar.common.constant.RestApis.FIND_BY_ID;
import static com.caglar.common.constant.RestApis.PRODUCT;
import static com.caglar.common.constant.RestApis.UPDATE;

@RestController
@RequestMapping(PRODUCT)
@RequiredArgsConstructor
public class ProductController extends BaseController implements IProductApi {

    private final ProductService productService;

    @Override
    @PostMapping(CREATE)
    @PreAuthorize("hasAnyRole('ADMIN','SELLER')")
    public ResponseEntity<BaseResponse<ProductResponseDto>> create(@RequestHeader(value = "X-User-Id", required = false) Long sellerAuthId,
                                                                   @Valid @RequestBody CreateProductRequestDto dto) {
        return created(productService.create(dto, sellerAuthId));
    }

    @Override
    @PutMapping(UPDATE + "/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SELLER')")
    public ResponseEntity<BaseResponse<ProductResponseDto>> update(@PathVariable String id,
                                                                   @Valid @RequestBody UpdateProductRequestDto dto) {
        return ok(productService.update(id, dto));
    }

    @PutMapping("/{id}/stock")
    public ResponseEntity<BaseResponse<Void>> updateStock(@PathVariable String id,
                                                          @RequestParam int quantity) {
        productService.updateStock(id, quantity);
        return ok();
    }

    @Override
    @DeleteMapping(DELETE + "/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SELLER')")
    public ResponseEntity<BaseResponse<Void>> remove(@PathVariable String id) {
        productService.remove(id);
        return ok();
    }

    @Override
    @GetMapping(FIND_BY_ID + "/{id}")
    public ResponseEntity<BaseResponse<ProductResponseDto>> getById(@PathVariable String id) {
        return ok(productService.getById(id));
    }

    @Override
    @GetMapping(FIND_ALL)
    public ResponseEntity<BaseResponse<Page<ProductResponseDto>>> getList(@RequestParam(required = false) String q,
                                                                          @RequestParam(required = false) String categoryId,
                                                                          @RequestParam(required = false) String brandId,
                                                                          Pageable pageable) {
        return ok(productService.getList(q, categoryId, brandId, pageable));
    }
}
