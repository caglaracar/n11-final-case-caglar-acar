package com.caglar.product.controller.impl;

import com.caglar.common.controller.BaseController;
import com.caglar.common.dto.BaseResponse;
import com.caglar.product.controller.ICategoryApi;
import com.caglar.product.dto.request.CreateCategoryRequestDto;
import com.caglar.product.dto.request.UpdateCategoryRequestDto;
import com.caglar.product.dto.response.CategoryResponseDto;
import com.caglar.product.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import static com.caglar.common.constant.RestApis.CREATE;
import static com.caglar.common.constant.RestApis.DELETE;
import static com.caglar.common.constant.RestApis.FIND_ALL;
import static com.caglar.common.constant.RestApis.PRODUCT;
import static com.caglar.common.constant.RestApis.UPDATE;

@RestController
@RequestMapping(PRODUCT + "/category")
@RequiredArgsConstructor
public class CategoryController extends BaseController implements ICategoryApi {

    private final CategoryService categoryService;

    @Override
    @PostMapping(CREATE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BaseResponse<CategoryResponseDto>> create(@Valid @RequestBody CreateCategoryRequestDto dto) {
        return created(categoryService.create(dto));
    }

    @Override
    @PutMapping(UPDATE + "/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BaseResponse<CategoryResponseDto>> update(@PathVariable String id,
                                                                    @Valid @RequestBody UpdateCategoryRequestDto dto) {
        return ok(categoryService.update(id, dto));
    }

    @Override
    @DeleteMapping(DELETE + "/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BaseResponse<Void>> remove(@PathVariable String id) {
        categoryService.remove(id);
        return ok();
    }

    @Override
    @GetMapping(FIND_ALL)
    public ResponseEntity<BaseResponse<List<CategoryResponseDto>>> getList() {
        return ok(categoryService.getList());
    }
}
