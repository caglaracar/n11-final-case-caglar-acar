package com.caglar.notification.controller.impl;

import com.caglar.common.controller.BaseController;
import com.caglar.common.dto.BaseResponse;
import com.caglar.notification.dto.request.OrderConfirmedRequestDto;
import com.caglar.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static com.caglar.common.constant.RestApis.NOTIFICATION;

@Slf4j
@RestController
@RequestMapping(NOTIFICATION)
@RequiredArgsConstructor
public class NotificationController extends BaseController {

    private final NotificationService notificationService;

    @PostMapping("/order-confirmed")
    public ResponseEntity<BaseResponse<Boolean>> orderConfirmed(@RequestBody OrderConfirmedRequestDto dto) {
        log.info("order-confirmed orderId={} to={}", dto.orderId(), dto.customerEmail());
        notificationService.sendOrderConfirmed(dto);
        return ok(true);
    }
}
