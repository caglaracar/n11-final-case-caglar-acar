package com.caglar.order.dto.request;

import jakarta.validation.constraints.NotBlank;

public record CheckoutRequestDto(
        @NotBlank String addressId,

        String clientIp
) {}
