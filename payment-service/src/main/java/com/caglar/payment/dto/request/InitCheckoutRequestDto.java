package com.caglar.payment.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.util.List;

/**
 * order-service → payment-service (Feign).
 * İyzico Checkout Form Initialize için gerekli alanlar.
 */
public record InitCheckoutRequestDto(
        @NotNull Long orderId,
        @NotNull Long authId,
        @NotNull @Positive Double totalAmount,
        @NotBlank String currency,
        @NotNull @Valid Buyer buyer,
        @NotNull @Valid Address shippingAddress,
        @NotNull @Valid Address billingAddress,
        @NotEmpty @Valid List<Item> items
) {

    public record Buyer(
            @NotBlank String name,
            @NotBlank String surname,
            @NotBlank String email,
            @NotBlank String gsmNumber,
            @NotBlank String identityNumber,
            @NotBlank String registrationAddress,
            @NotBlank String city,
            @NotBlank String country,
            String ip
    ) {}

    public record Address(
            @NotBlank String contactName,
            @NotBlank String city,
            @NotBlank String country,
            @NotBlank String address,
            String zipCode
    ) {}

    public record Item(
            @NotBlank String productId,
            @NotBlank String name,
            @NotBlank String category,
            @NotNull @Positive Double price,
            @Min(1) int quantity
    ) {}
}
