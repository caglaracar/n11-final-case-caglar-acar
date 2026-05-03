package com.caglar.notification.service;

import com.caglar.notification.dto.request.OrderConfirmedRequestDto;

public interface NotificationService {

    void sendOrderConfirmed(OrderConfirmedRequestDto dto);
}
