package com.caglar.product.controller.impl;

import com.caglar.common.controller.BaseController;
import com.caglar.common.dto.BaseResponse;
import com.caglar.product.controller.IBrandApi;
import com.caglar.product.dto.request.CreateBrandRequestDto;
import com.caglar.product.dto.request.UpdateBrandRequestDto;
import com.caglar.product.dto.response.BrandResponseDto;
import com.caglar.product.service.BrandService;
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
@RequestMapping(PRODUCT + "/brand")
@RequiredArgsConstructor
public class BrandController extends BaseController implements IBrandApi {

    private final BrandService brandService;

    @Override
    @PostMapping(CREATE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BaseResponse<BrandResponseDto>> create(@Valid @RequestBody CreateBrandRequestDto dto) {
        return created(brandService.create(dto));
    }

    @Override
    @PutMapping(UPDATE + "/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BaseResponse<BrandResponseDto>> update(@PathVariable String id,
                                                                 @Valid @RequestBody UpdateBrandRequestDto dto) {
        return ok(brandService.update(id, dto));
    }

    @Override
    @DeleteMapping(DELETE + "/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BaseResponse<Void>> remove(@PathVariable String id) {
        brandService.remove(id);
        return ok();
    }

    @Override
    @GetMapping(FIND_ALL)
    public ResponseEntity<BaseResponse<List<BrandResponseDto>>> getList() {
        return ok(brandService.getList());
    }
}
