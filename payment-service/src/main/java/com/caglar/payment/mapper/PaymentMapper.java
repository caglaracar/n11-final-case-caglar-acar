package com.caglar.payment.mapper;

import com.caglar.common.event.OrderCreatedEvent;
import com.caglar.payment.dto.response.PaymentResponseDto;
import com.caglar.payment.entity.Payment;
import com.caglar.payment.enums.PaymentStatus;
import com.caglar.payment.client.OrderServiceClient;

public final class PaymentMapper {

    private PaymentMapper() {}

    public static PaymentResponseDto toResponse(Payment p) {
        return PaymentResponseDto.builder()
                .orderId(p.getOrderId())
                .paymentId(p.getId())
                .success(p.getStatus() == PaymentStatus.SUCCESS)
                .providerRef(p.getProviderRef())
                .failReason(p.getFailReason())
                .status(p.getStatus().name())
                .build();
    }

    /** {@link OrderCreatedEvent}'ten initial PENDING payment kaydı. */
    public static Payment fromOrderEvent(OrderCreatedEvent ev) {
        return Payment.builder()
                .orderId(ev.orderId())
                .authId(ev.authId())
                .amount(ev.totalAmount())
                .currency(ev.currency())
                .status(PaymentStatus.PENDING)
                .build();
    }

    /** Order servisinden çekilen özetten self-heal PENDING payment kaydı. */
    public static Payment fromOrderSummary(OrderServiceClient.OrderSummary order) {
        return Payment.builder()
                .orderId(order.id())
                .authId(order.authId())
                .amount(order.totalAmount())
                .currency(order.currency())
                .status(PaymentStatus.PENDING)
                .build();
    }
}
