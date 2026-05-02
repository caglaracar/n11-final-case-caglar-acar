package com.caglar.product.stock;

import com.caglar.common.controller.BaseController;
import com.caglar.common.dto.BaseResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static com.caglar.common.constant.RestApis.PRODUCT;

@RestController
@RequestMapping(PRODUCT + "/stock")
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
}
