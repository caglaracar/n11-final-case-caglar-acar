package com.caglar.order.controller.impl;

import com.caglar.common.controller.BaseController;
import com.caglar.common.dto.BaseResponse;
import com.caglar.order.dto.response.OrderResponseDto;
import com.caglar.order.enums.OrderStatus;
import com.caglar.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RestController;

import static com.caglar.common.constant.RestApis.ADMIN;

@RestController
@RequestMapping(ADMIN + "/orders")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminOrderController extends BaseController {

    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<BaseResponse<Page<OrderResponseDto>>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) OrderStatus status) {
        return ok(orderService.adminGetOrders(page, size, status));
    }

    @PostMapping("/{id}/status")
    public ResponseEntity<BaseResponse<OrderResponseDto>> updateStatus(
            @PathVariable Long id,
            @RequestParam OrderStatus status) {
        return ok(orderService.adminUpdateStatus(id, status));
    }
}
