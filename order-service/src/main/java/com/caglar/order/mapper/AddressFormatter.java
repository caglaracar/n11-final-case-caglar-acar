package com.caglar.order.mapper;

import com.caglar.order.client.dto.AddressDto;

/**
 * AddressDto için tek satırlık okunaklı string üretir.
 * Örnek: "Atatürk Cad. No:1, Kadıköy, İstanbul/Marmara"
 */
public final class AddressFormatter {

    private AddressFormatter() {}

    public static String format(AddressDto address) {
        StringBuilder builder = new StringBuilder();
        appendIfPresent(builder, address.line1(), null);
        appendIfPresent(builder, address.line2(), ", ");
        appendIfPresent(builder, address.city(), ", ");
        appendIfPresent(builder, address.state(), "/");
        return builder.toString();
    }

    private static void appendIfPresent(StringBuilder builder, String value, String separator) {
        if (value == null || value.isBlank()) {
            return;
        }
        if (separator != null && !builder.isEmpty()) {
            builder.append(separator);
        }
        builder.append(value);
    }
}
