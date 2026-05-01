package com.caglar.product.controller.impl;

import com.caglar.common.controller.BaseController;
import com.caglar.common.dto.BaseResponse;
import com.caglar.product.controller.IBannerApi;
import com.caglar.product.dto.request.CreateBannerRequestDto;
import com.caglar.product.dto.request.UpdateBannerRequestDto;
import com.caglar.product.dto.response.BannerResponseDto;
import com.caglar.product.service.BannerService;
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

import static com.caglar.common.constant.RestApis.BANNER;
import static com.caglar.common.constant.RestApis.CREATE;
import static com.caglar.common.constant.RestApis.DELETE;
import static com.caglar.common.constant.RestApis.FIND_ALL;
import static com.caglar.common.constant.RestApis.FIND_BY_ID;
import static com.caglar.common.constant.RestApis.UPDATE;

@RestController
@RequestMapping(BANNER)
@RequiredArgsConstructor
public class BannerController extends BaseController implements IBannerApi {

    private final BannerService bannerService;

    @Override
    @GetMapping(FIND_ALL)
    public ResponseEntity<BaseResponse<List<BannerResponseDto>>> getActiveList() {
        return ok(bannerService.getActiveList());
    }

    @Override
    @GetMapping("/admin" + FIND_ALL)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BaseResponse<List<BannerResponseDto>>> getList() {
        return ok(bannerService.getList());
    }

    @Override
    @GetMapping(FIND_BY_ID + "/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BaseResponse<BannerResponseDto>> getById(@PathVariable String id) {
        return ok(bannerService.getById(id));
    }

    @Override
    @PostMapping(CREATE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BaseResponse<BannerResponseDto>> create(@Valid @RequestBody CreateBannerRequestDto dto) {
        return created(bannerService.create(dto));
    }

    @Override
    @PutMapping(UPDATE + "/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BaseResponse<BannerResponseDto>> update(@PathVariable String id,
                                                                  @Valid @RequestBody UpdateBannerRequestDto dto) {
        return ok(bannerService.update(id, dto));
    }

    @Override
    @DeleteMapping(DELETE + "/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BaseResponse<Void>> remove(@PathVariable String id) {
        bannerService.remove(id);
        return ok();
    }
}
