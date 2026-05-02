package com.caglar.product.controller.impl;

import com.caglar.common.controller.BaseController;
import com.caglar.common.dto.BaseResponse;
import com.caglar.product.controller.IProductCatalogApi;
import com.caglar.product.dto.response.ProductResponseDto;
import com.caglar.product.service.ProductCatalogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import static com.caglar.common.constant.RestApis.PRODUCT;

@RestController
@RequestMapping(PRODUCT)
@RequiredArgsConstructor
public class ProductCatalogController extends BaseController implements IProductCatalogApi {

    private final ProductCatalogService productCatalogService;

    @Override
    @GetMapping("/popular")
    public ResponseEntity<BaseResponse<List<ProductResponseDto>>> getPopularList(@RequestParam(defaultValue = "5") int limit) {
        return ok(productCatalogService.getPopularList(limit));
    }

    @Override
    @GetMapping("/price-drops")
    public ResponseEntity<BaseResponse<List<ProductResponseDto>>> getPriceDropList(@RequestParam(defaultValue = "12") int limit) {
        return ok(productCatalogService.getPriceDropList(limit));
    }

    @Override
    @GetMapping("/flash-deals")
    public ResponseEntity<BaseResponse<List<ProductResponseDto>>> getFlashDealList() {
        return ok(productCatalogService.getFlashDealList());
    }
}
