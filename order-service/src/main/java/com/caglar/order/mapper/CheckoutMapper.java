package com.caglar.order.mapper;

import com.caglar.order.client.dto.AddressDto;
import com.caglar.order.client.dto.BasketDto;
import com.caglar.order.client.dto.InitCheckoutRequest;
import com.caglar.order.client.dto.StockOpRequest;
import com.caglar.order.client.dto.UserProfileDto;
import com.caglar.order.entity.Order;
import com.caglar.order.entity.OrderItem;
import com.caglar.order.enums.OrderStatus;

import java.util.List;

/**
 * Checkout akışı boyunca yapılan dönüşümleri tek yerde toplar:
 *  - Sepet + profil + adres → PENDING Order
 *  - Order → product-service stock isteği
 *  - Order → payment-service iyzico init isteği
 */
public final class CheckoutMapper {

    private static final String SANDBOX_IDENTITY_NUMBER = "11111111111";
    private static final String DEFAULT_NAME = "Müşteri";
    private static final String DEFAULT_SURNAME = "n11";
    private static final String DEFAULT_PHONE = "+905555555555";
    private static final String DEFAULT_COUNTRY = "Turkey";
    private static final String DEFAULT_CATEGORY = "General";

    private CheckoutMapper() {}

    public static Order toPendingOrder(Long authId,
                                       BasketDto basket,
                                       UserProfileDto profile,
                                       AddressDto address,
                                       String currency) {
        Order order = Order.builder()
                .authId(authId)
                .customerEmail(profile.email())
                .customerName(fullName(profile))
                .totalAmount(basket.total())
                .currency(currency)
                .status(OrderStatus.PENDING)
                .shippingAddress(AddressFormatter.format(address))
                .shippingCity(address.city())
                .build();
        basket.items().forEach(item -> order.addItem(toOrderItem(item)));
        return order;
    }

    public static StockOpRequest toStockOpRequest(Order order) {
        List<StockOpRequest.Item> items = order.getItems().stream()
                .map(item -> new StockOpRequest.Item(item.getProductId(), item.getQuantity()))
                .toList();
        return new StockOpRequest(order.getId(), items);
    }

    public static InitCheckoutRequest toInitCheckoutRequest(Order order,
                                                            UserProfileDto profile,
                                                            AddressDto address,
                                                            String clientIp) {
        InitCheckoutRequest.Buyer buyer = toBuyer(profile, address, clientIp);
        InitCheckoutRequest.Address shippingAndBilling = toAddress(address);
        List<InitCheckoutRequest.Item> items = order.getItems().stream()
                .map(CheckoutMapper::toInitItem)
                .toList();
        return new InitCheckoutRequest(
                order.getId(),
                order.getAuthId(),
                order.getTotalAmount(),
                order.getCurrency(),
                buyer,
                shippingAndBilling,
                shippingAndBilling,
                items
        );
    }

    // ---- private helpers ----

    private static OrderItem toOrderItem(BasketDto.Item item) {
        return OrderItem.builder()
                .productId(item.productId())
                .productName(item.productName())
                .unitPrice(item.unitPrice())
                .quantity(item.quantity())
                .build();
    }

    private static InitCheckoutRequest.Buyer toBuyer(UserProfileDto profile, AddressDto address, String clientIp) {
        return new InitCheckoutRequest.Buyer(
                defaultIfBlank(profile.name(), DEFAULT_NAME),
                defaultIfBlank(profile.surName(), DEFAULT_SURNAME),
                profile.email(),
                defaultIfBlank(profile.phone(), DEFAULT_PHONE),
                SANDBOX_IDENTITY_NUMBER,
                AddressFormatter.format(address),
                address.city(),
                defaultIfBlank(address.country(), DEFAULT_COUNTRY),
                clientIp
        );
    }

    private static InitCheckoutRequest.Address toAddress(AddressDto address) {
        return new InitCheckoutRequest.Address(
                address.fullName(),
                address.city(),
                defaultIfBlank(address.country(), DEFAULT_COUNTRY),
                AddressFormatter.format(address),
                address.zipCode()
        );
    }

    private static InitCheckoutRequest.Item toInitItem(OrderItem item) {
        return new InitCheckoutRequest.Item(
                item.getProductId(),
                item.getProductName(),
                defaultIfBlank(item.getCategory(), DEFAULT_CATEGORY),
                item.getUnitPrice(),
                item.getQuantity()
        );
    }

    private static String fullName(UserProfileDto profile) {
        String name = defaultIfBlank(profile.name(), "");
        String surname = defaultIfBlank(profile.surName(), "");
        return (name + " " + surname).trim();
    }

    private static String defaultIfBlank(String value, String fallback) {
        return (value == null || value.isBlank()) ? fallback : value;
    }
}
