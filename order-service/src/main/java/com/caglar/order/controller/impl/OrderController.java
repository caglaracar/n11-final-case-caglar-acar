package com.caglar.order.controller.impl;

import com.caglar.common.controller.BaseController;
import com.caglar.common.dto.BaseResponse;
import com.caglar.order.controller.IOrderApi;
import com.caglar.order.dto.request.CheckoutRequestDto;
import com.caglar.order.dto.response.CheckoutResponseDto;
import com.caglar.order.dto.response.OrderResponseDto;
import com.caglar.order.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import static com.caglar.common.constant.RestApis.ORDER;

@RestController
@RequestMapping(ORDER)
@RequiredArgsConstructor
public class OrderController extends BaseController implements IOrderApi {

    private final OrderService orderService;

    @Override
    @PostMapping("/checkout")
    public ResponseEntity<BaseResponse<CheckoutResponseDto>> checkout(
            @RequestHeader("X-User-Id") Long authId,
            @Valid @RequestBody CheckoutRequestDto dto) {
        return ok(orderService.checkout(authId, dto));
    }

    @Override
    @GetMapping("/me")
    public ResponseEntity<BaseResponse<List<OrderResponseDto>>> myOrders(
            @RequestHeader("X-User-Id") Long authId) {
        return ok(orderService.getMyOrders(authId));
    }

    @Override
    @GetMapping("/{id}")
    public ResponseEntity<BaseResponse<OrderResponseDto>> getById(
            @RequestHeader("X-User-Id") Long authId,
            @PathVariable Long id) {
        return ok(orderService.getById(authId, id));
    }

    @Override
    @PostMapping("/{id}/cancel")
    public ResponseEntity<BaseResponse<OrderResponseDto>> cancel(
            @RequestHeader("X-User-Id") Long authId,
            @PathVariable Long id) {
        return ok(orderService.cancel(authId, id));
    }
}
