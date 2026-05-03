package com.caglar.stock.controller.impl;

import com.caglar.common.controller.BaseController;
import com.caglar.common.dto.BaseResponse;
import com.caglar.stock.controller.IStockApi;
import com.caglar.stock.dto.request.StockOpRequestDto;
import com.caglar.stock.dto.response.StockResponseDto;
import com.caglar.stock.service.StockService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import static com.caglar.common.constant.RestApis.STOCK;

@RestController
@RequestMapping(STOCK)
@RequiredArgsConstructor
public class StockController extends BaseController implements IStockApi {

    private final StockService stockService;

    @Override
    @PostMapping("/reserve")
    public ResponseEntity<BaseResponse<Void>> reserve(@Valid @RequestBody StockOpRequestDto dto) {
        stockService.reserve(dto);
        return ok();
    }

    @Override
    @PostMapping("/release")
    public ResponseEntity<BaseResponse<Void>> release(@Valid @RequestBody StockOpRequestDto dto) {
        stockService.release(dto);
        return ok();
    }

    @Override
    @GetMapping("/{productId}")
    public ResponseEntity<BaseResponse<StockResponseDto>> getByProductId(@PathVariable String productId) {
        return ok(stockService.getByProductId(productId));
    }

    @Override
    @PutMapping("/{productId}")
    public ResponseEntity<BaseResponse<StockResponseDto>> set(@PathVariable String productId,
                                                              @RequestParam int quantity) {
        return ok(stockService.set(productId, quantity));
    }
}
