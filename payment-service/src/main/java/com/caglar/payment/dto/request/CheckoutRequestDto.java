package com.caglar.payment.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Builder;

@Builder
public record CheckoutRequestDto(

        @NotNull
        Long orderId,

        @NotBlank
        @Size(min = 2, max = 60)
        String holderName,

        @NotBlank
        @Pattern(regexp = "\\d{16}", message = "Kart numarası 16 haneli olmalıdır")
        String cardNumber,

        @NotBlank
        @Pattern(regexp = "0[1-9]|1[0-2]", message = "Ay 01-12 arasında olmalıdır")
        String expireMonth,

        @NotBlank
        @Pattern(regexp = "20\\d{2}", message = "Yıl geçersiz")
        String expireYear,

        @NotBlank
        @Pattern(regexp = "\\d{3,4}", message = "CVC 3 veya 4 haneli olmalıdır")
        String cvc
) {}
