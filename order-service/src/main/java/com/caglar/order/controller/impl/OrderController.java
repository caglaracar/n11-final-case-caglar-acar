package com.caglar.order.controller.impl;

import com.caglar.common.controller.BaseController;
import com.caglar.common.dto.BaseResponse;
import com.caglar.order.controller.IOrderApi;
import com.caglar.order.dto.request.CreateOrderRequestDto;
import com.caglar.order.dto.response.OrderResponseDto;
import com.caglar.order.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import static com.caglar.common.constant.RestApis.CREATE;
import static com.caglar.common.constant.RestApis.FIND_BY_ID;
import static com.caglar.common.constant.RestApis.ME;
import static com.caglar.common.constant.RestApis.ORDER;

@RestController
@RequestMapping(ORDER)
@RequiredArgsConstructor
public class OrderController extends BaseController implements IOrderApi {

    private final OrderService orderService;

    @Override
    @PostMapping(CREATE)
    public ResponseEntity<BaseResponse<OrderResponseDto>> create(@RequestHeader("X-User-Id") Long authId,
                                                                 @Valid @RequestBody CreateOrderRequestDto dto) {
        return created(orderService.createOrder(authId, dto));
    }

    @Override
    @GetMapping(FIND_BY_ID + "/{id}")
    public ResponseEntity<BaseResponse<OrderResponseDto>> getById(@PathVariable Long id) {
        return ok(orderService.getById(id));
    }

    @Override
    @GetMapping(ME)
    public ResponseEntity<BaseResponse<Page<OrderResponseDto>>> getMyList(@RequestHeader("X-User-Id") Long authId,
                                                                         Pageable pageable) {
        return ok(orderService.getMyList(authId, pageable));
    }

    @Override
    @PostMapping("/cancel/{id}")
    public ResponseEntity<BaseResponse<OrderResponseDto>> cancel(@PathVariable Long id) {
        return ok(orderService.cancel(id));
    }

    @Override
    @GetMapping("/track")
    public ResponseEntity<BaseResponse<OrderResponseDto>> track(@RequestParam("orderId") Long orderId) {
        return ok(orderService.getById(orderId));
    }

    @Override
    @GetMapping("/confirm-delivery")
    public ResponseEntity<BaseResponse<OrderResponseDto>> confirmDelivery(@RequestParam("orderId") Long orderId,
                                                                          @RequestParam("token") String token) {
        return ok(orderService.confirmDelivery(orderId, token));
    }
}
