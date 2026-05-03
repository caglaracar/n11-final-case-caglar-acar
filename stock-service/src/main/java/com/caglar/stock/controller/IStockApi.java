package com.caglar.stock.controller;

import com.caglar.common.dto.BaseResponse;
import com.caglar.stock.dto.request.StockOpRequestDto;
import com.caglar.stock.dto.response.StockResponseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

@Tag(name = "Stock", description = "Stok yönetimi")
public interface IStockApi {

    @Operation(summary = "Stok rezerve et")
    ResponseEntity<BaseResponse<Void>> reserve(@Valid @RequestBody StockOpRequestDto dto);

    @Operation(summary = "Stok iade et")
    ResponseEntity<BaseResponse<Void>> release(@Valid @RequestBody StockOpRequestDto dto);

    @Operation(summary = "Ürün stoğunu getir")
    ResponseEntity<BaseResponse<StockResponseDto>> getByProductId(@PathVariable String productId);

    @Operation(summary = "Ürün stoğunu ayarla (admin)")
    ResponseEntity<BaseResponse<StockResponseDto>> set(@PathVariable String productId,
                                                       @RequestParam int quantity);
}
