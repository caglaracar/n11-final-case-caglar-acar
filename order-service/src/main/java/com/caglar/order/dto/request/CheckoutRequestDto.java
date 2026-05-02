package com.caglar.order.dto.request;

import jakarta.validation.constraints.NotBlank;

/**
 * POST /order/checkout — frontend yalnızca seçili adresin id'sini gönderir.
 * Sepet ve kullanıcı bilgileri sırasıyla basket-service ve user-service'ten alınır.
 */
public record CheckoutRequestDto(
        @NotBlank String addressId,
        /** Frontend'den iletilen istemci IP'si (iyzico için). */
        String clientIp
) {}
