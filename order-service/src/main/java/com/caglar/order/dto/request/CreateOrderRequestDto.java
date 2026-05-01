package com.caglar.order.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Builder;

import java.util.List;

@Builder
public record CreateOrderRequestDto(

        @NotEmpty
        @Valid
        List<Item> items,

        @NotBlank
        String currency,

        /** Kargo bildirim e-postası için. Frontend, giriş yapmış kullanıcının e-postasını gönderir. */
        String userEmail
) {

    @Builder
    public record Item(
            @NotBlank String productId,
            @NotBlank String productName,
            @NotNull @Min(1) Integer quantity,
            @NotNull @Positive Double unitPrice
    ) {}
}
