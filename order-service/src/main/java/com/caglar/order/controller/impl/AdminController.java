package com.caglar.order.controller.impl;

import com.caglar.common.controller.BaseController;
import com.caglar.common.dto.BaseResponse;
import com.caglar.order.controller.IAdminApi;
import com.caglar.order.dto.response.AdminStatsResponseDto;
import com.caglar.order.dto.response.OrderResponseDto;
import com.caglar.order.enums.OrderStatus;
import com.caglar.order.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import static com.caglar.common.constant.RestApis.ADMIN;

@RestController
@RequestMapping(ADMIN)
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController extends BaseController implements IAdminApi {

    private final AdminService adminService;

    @Override
    @GetMapping("/stats")
    public ResponseEntity<BaseResponse<AdminStatsResponseDto>> stats() {
        return ok(adminService.stats());
    }

    @Override
    @GetMapping("/orders")
    public ResponseEntity<BaseResponse<Page<OrderResponseDto>>> orders(
            @RequestParam(required = false) OrderStatus status, Pageable pageable) {
        return ok(adminService.orders(status, pageable));
    }

    @Override
    @PostMapping("/orders/{id}/status")
    public ResponseEntity<BaseResponse<OrderResponseDto>> updateStatus(@PathVariable Long id,
                                                                        @RequestParam OrderStatus status) {
        return ok(adminService.updateStatus(id, status));
    }
}
