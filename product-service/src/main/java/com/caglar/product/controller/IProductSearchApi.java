package com.caglar.product.controller;

import com.caglar.common.dto.BaseResponse;
import com.caglar.product.dto.response.TrendingTermResponseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@Tag(name = "Product Search", description = "Arama istatistikleri")
public interface IProductSearchApi {

    @Operation(summary = "En çok aranan terimler (Redis ZSET)")
    ResponseEntity<BaseResponse<List<TrendingTermResponseDto>>> getTrendingTermList(
            @RequestParam(defaultValue = "10") int limit);
}
