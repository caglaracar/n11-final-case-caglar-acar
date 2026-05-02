package com.caglar.product.controller.impl;

import com.caglar.common.controller.BaseController;
import com.caglar.common.dto.BaseResponse;
import com.caglar.product.controller.IProductSearchApi;
import com.caglar.product.dto.response.TrendingTermResponseDto;
import com.caglar.product.service.SearchStatsService;
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
public class ProductSearchController extends BaseController implements IProductSearchApi {

    private final SearchStatsService searchStatsService;

    @Override
    @GetMapping("/search/trending")
    public ResponseEntity<BaseResponse<List<TrendingTermResponseDto>>> getTrendingTermList(
            @RequestParam(defaultValue = "10") int limit) {
        return ok(searchStatsService.topTerms(limit));
    }
}
