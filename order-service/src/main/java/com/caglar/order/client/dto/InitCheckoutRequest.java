package com.caglar.order.client.dto;

import java.util.List;

public record InitCheckoutRequest(
        Long orderId,
        Long authId,
        Double totalAmount,
        String currency,
        Buyer buyer,
        Address shippingAddress,
        Address billingAddress,
        List<Item> items
) {
    public record Buyer(
            String name,
            String surname,
            String email,
            String gsmNumber,
            String identityNumber,
            String registrationAddress,
            String city,
            String country,
            String ip
    ) {}

    public record Address(
            String contactName,
            String city,
            String country,
            String address,
            String zipCode
    ) {}

    public record Item(
            String productId,
            String name,
            String category,
            Double price,
            int quantity
    ) {}
}
