package com.caglar.basket.controller.impl;

import com.caglar.basket.controller.IBasketApi;
import com.caglar.basket.dto.request.AddToBasketRequestDto;
import com.caglar.basket.dto.request.UpdateBasketItemRequestDto;
import com.caglar.basket.dto.response.BasketResponseDto;
import com.caglar.basket.service.BasketService;
import com.caglar.common.controller.BaseController;
import com.caglar.common.dto.BaseResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import static com.caglar.common.constant.RestApis.BASKET;

@RestController
@RequestMapping(BASKET)
@RequiredArgsConstructor
public class BasketController extends BaseController implements IBasketApi {

    private final BasketService basketService;

    @Override
    @GetMapping
    public ResponseEntity<BaseResponse<BasketResponseDto>> getMyBasket(@RequestHeader("X-User-Id") Long authId) {
        return ok(basketService.getMyBasket(authId));
    }

    @Override
    @PostMapping("/add")
    public ResponseEntity<BaseResponse<BasketResponseDto>> add(@RequestHeader("X-User-Id") Long authId,
                                                             @Valid @RequestBody AddToBasketRequestDto dto) {
        return ok(basketService.addItem(authId, dto));
    }

    @Override
    @PutMapping("/update")
    public ResponseEntity<BaseResponse<BasketResponseDto>> update(@RequestHeader("X-User-Id") Long authId,
                                                                @Valid @RequestBody UpdateBasketItemRequestDto dto) {
        return ok(basketService.updateItem(authId, dto));
    }

    @Override
    @DeleteMapping("/remove/{productId}")
    public ResponseEntity<BaseResponse<BasketResponseDto>> remove(@RequestHeader("X-User-Id") Long authId,
                                                                @PathVariable String productId) {
        return ok(basketService.removeItem(authId, productId));
    }

    @Override
    @DeleteMapping("/clear")
    public ResponseEntity<BaseResponse<Void>> clear(@RequestHeader("X-User-Id") Long authId) {
        basketService.clear(authId);
        return noContent();
    }
}
