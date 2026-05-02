package com.caglar.payment.mapper;

import com.caglar.payment.dto.request.InitCheckoutRequestDto;
import com.iyzipay.model.Address;
import com.iyzipay.model.BasketItem;
import com.iyzipay.model.BasketItemType;
import com.iyzipay.model.Buyer;
import com.iyzipay.model.Currency;
import com.iyzipay.model.Locale;
import com.iyzipay.model.PaymentGroup;
import com.iyzipay.request.CreateCheckoutFormInitializeRequest;
import com.iyzipay.request.RetrieveCheckoutFormRequest;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

/**
 * Domain DTO → iyzipay-java SDK request dönüşümleri.
 * IyzicoServiceImpl iş mantığa odaklanabilsin diye tüm mapping burada.
 */
public final class IyzicoRequestMapper {

    private static final String DEFAULT_IP = "127.0.0.1";

    private IyzicoRequestMapper() {}

    public static CreateCheckoutFormInitializeRequest toInitializeRequest(InitCheckoutRequestDto dto,
                                                                          String callbackUrl) {
        BigDecimal price = toMoney(dto.totalAmount());
        CreateCheckoutFormInitializeRequest request = new CreateCheckoutFormInitializeRequest();
        request.setLocale(Locale.TR.getValue());
        request.setConversationId(String.valueOf(dto.orderId()));
        request.setBasketId(String.valueOf(dto.orderId()));
        request.setPrice(price);
        request.setPaidPrice(price);
        request.setCurrency(toCurrency(dto.currency()));
        request.setPaymentGroup(PaymentGroup.PRODUCT.name());
        request.setCallbackUrl(callbackUrl);
        request.setBuyer(toBuyer(dto));
        request.setShippingAddress(toAddress(dto.shippingAddress()));
        request.setBillingAddress(toAddress(dto.billingAddress()));
        request.setBasketItems(toBasketItems(dto.items()));
        return request;
    }

    public static RetrieveCheckoutFormRequest toRetrieveRequest(String token, Long orderId) {
        RetrieveCheckoutFormRequest request = new RetrieveCheckoutFormRequest();
        request.setLocale(Locale.TR.getValue());
        request.setConversationId(String.valueOf(orderId));
        request.setToken(token);
        return request;
    }

    private static Buyer toBuyer(InitCheckoutRequestDto dto) {
        InitCheckoutRequestDto.Buyer source = dto.buyer();
        Buyer buyer = new Buyer();
        buyer.setId(String.valueOf(dto.authId()));
        buyer.setName(source.name());
        buyer.setSurname(source.surname());
        buyer.setEmail(source.email());
        buyer.setGsmNumber(source.gsmNumber());
        buyer.setIdentityNumber(source.identityNumber());
        buyer.setRegistrationAddress(source.registrationAddress());
        buyer.setCity(source.city());
        buyer.setCountry(source.country());
        buyer.setIp(source.ip() == null || source.ip().isBlank() ? DEFAULT_IP : source.ip());
        return buyer;
    }

    private static Address toAddress(InitCheckoutRequestDto.Address source) {
        Address address = new Address();
        address.setContactName(source.contactName());
        address.setCity(source.city());
        address.setCountry(source.country());
        address.setAddress(source.address());
        address.setZipCode(source.zipCode());
        return address;
    }

    private static List<BasketItem> toBasketItems(List<InitCheckoutRequestDto.Item> items) {
        return items.stream().map(IyzicoRequestMapper::toBasketItem).toList();
    }

    private static BasketItem toBasketItem(InitCheckoutRequestDto.Item item) {
        BasketItem basketItem = new BasketItem();
        basketItem.setId(item.productId());
        basketItem.setName(item.name());
        basketItem.setCategory1(item.category());
        basketItem.setItemType(BasketItemType.PHYSICAL.name());
        basketItem.setPrice(toMoney(item.price() * item.quantity()));
        return basketItem;
    }

    private static BigDecimal toMoney(Double amount) {
        return BigDecimal.valueOf(amount).setScale(2, RoundingMode.HALF_UP);
    }

    private static String toCurrency(String currency) {
        if (currency == null || currency.isBlank()) {
            return Currency.TRY.name();
        }
        try {
            return Currency.valueOf(currency.toUpperCase()).name();
        } catch (IllegalArgumentException ex) {
            return Currency.TRY.name();
        }
    }
}
