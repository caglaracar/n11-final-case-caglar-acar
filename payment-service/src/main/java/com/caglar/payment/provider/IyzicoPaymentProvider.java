package com.caglar.payment.provider;

import com.iyzipay.Options;
import com.iyzipay.model.Address;
import com.iyzipay.model.BasketItem;
import com.iyzipay.model.BasketItemType;
import com.iyzipay.model.Buyer;
import com.iyzipay.model.Currency;
import com.iyzipay.model.Locale;
import com.iyzipay.model.Payment;
import com.iyzipay.model.PaymentCard;
import com.iyzipay.model.PaymentChannel;
import com.iyzipay.model.PaymentGroup;
import com.iyzipay.request.CreatePaymentRequest;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

/**
 * İyzico sandbox entegrasyonu — resmi iyzipay-java SDK ile.
 * Kart bilgisi hiçbir zaman loglanmaz, DB'ye veya Kafka'ya yazılmaz.
 */
@Slf4j
@Component
@ConditionalOnProperty(name = "payment.provider", havingValue = "iyzico")
public class IyzicoPaymentProvider implements PaymentProvider {

    @Value("${iyzico.api-key}")
    private String apiKey;

    @Value("${iyzico.secret-key}")
    private String secretKey;

    @Value("${iyzico.base-url:https://sandbox-api.iyzipay.com}")
    private String baseUrl;

    private Options options;

    @PostConstruct
    void init() {
        options = new Options();
        options.setApiKey(apiKey);
        options.setSecretKey(secretKey);
        options.setBaseUrl(baseUrl);
        log.info("İyzico provider initialized (baseUrl={}, apiKey={}***)",
                baseUrl, apiKey != null && apiKey.length() > 12 ? apiKey.substring(0, 12) : "?");
    }

    @Override
    public PaymentResult charge(Long orderId, Double amount, String currency, CardInfo card) {
        try {
            CreatePaymentRequest request = buildRequest(orderId, amount, currency, card);
            Payment payment = Payment.create(request, options);

            if ("success".equalsIgnoreCase(payment.getStatus())) {
                log.info("İyzico charge SUCCESS orderId={} paymentId={}", orderId, payment.getPaymentId());
                return PaymentResult.success("iyzico-" + payment.getPaymentId());
            }

            log.warn("İyzico charge FAILED orderId={} errorCode={} errorGroup={} msg={}",
                    orderId, payment.getErrorCode(), payment.getErrorGroup(), payment.getErrorMessage());
            String msg = payment.getErrorMessage() != null ? payment.getErrorMessage() : "İyzico ödeme reddedildi";
            return PaymentResult.failure(msg);

        } catch (Exception e) {
            log.error("İyzico charge exception orderId={}", orderId, e);
            return PaymentResult.failure("Ödeme servisi bağlantı hatası: " + e.getMessage());
        }
    }

    private CreatePaymentRequest buildRequest(Long orderId, Double amount, String currency, CardInfo card) {
        BigDecimal price = BigDecimal.valueOf(amount).setScale(2, RoundingMode.HALF_UP);

        CreatePaymentRequest request = new CreatePaymentRequest();
        request.setLocale(Locale.TR.getValue());
        request.setConversationId(String.valueOf(orderId));
        request.setPrice(price);
        request.setPaidPrice(price);
        request.setCurrency(parseCurrency(currency));
        request.setInstallment(1);
        request.setBasketId("BASKET-" + orderId);
        request.setPaymentChannel(PaymentChannel.WEB.name());
        request.setPaymentGroup(PaymentGroup.PRODUCT.name());

        // Card
        PaymentCard paymentCard = new PaymentCard();
        paymentCard.setCardHolderName(card.holderName());
        paymentCard.setCardNumber(card.cardNumber());
        paymentCard.setExpireMonth(card.expireMonth());
        paymentCard.setExpireYear(card.expireYear());
        paymentCard.setCvc(card.cvc());
        paymentCard.setRegisterCard(0);
        request.setPaymentCard(paymentCard);

        // Buyer (sandbox sample değerleri — bootcamp için yeterli)
        String holder = card.holderName() != null ? card.holderName().trim() : "Test User";
        int sp = holder.lastIndexOf(' ');
        String name    = sp > 0 ? holder.substring(0, sp) : holder;
        String surname = sp > 0 ? holder.substring(sp + 1) : "User";

        Buyer buyer = new Buyer();
        buyer.setId("BY-" + orderId);
        buyer.setName(name);
        buyer.setSurname(surname);
        buyer.setGsmNumber("+905350000000");
        buyer.setEmail("customer-" + orderId + "@n11-bootcamp.local");
        buyer.setIdentityNumber("74300864791");
        buyer.setLastLoginDate("2024-01-01 12:00:00");
        buyer.setRegistrationDate("2024-01-01 12:00:00");
        buyer.setRegistrationAddress("Nidakule Goztepe, Merdivenkoy Mah. Bora Sok. No:1");
        buyer.setIp("85.34.78.112");
        buyer.setCity("Istanbul");
        buyer.setCountry("Turkey");
        buyer.setZipCode("34732");
        request.setBuyer(buyer);

        // Address
        Address address = new Address();
        address.setContactName(holder);
        address.setCity("Istanbul");
        address.setCountry("Turkey");
        address.setAddress("Nidakule Goztepe, Merdivenkoy Mah. Bora Sok. No:1");
        address.setZipCode("34742");
        request.setShippingAddress(address);
        request.setBillingAddress(address);

        // Basket
        BasketItem item = new BasketItem();
        item.setId("ORDER-" + orderId);
        item.setName("Siparis-" + orderId);
        item.setCategory1("Genel");
        item.setItemType(BasketItemType.PHYSICAL.name());
        item.setPrice(price);
        request.setBasketItems(List.of(item));

        return request;
    }

    private String parseCurrency(String currency) {
        if (currency == null) {
            return Currency.TRY.name();
        }
        try {
            return Currency.valueOf(currency.toUpperCase()).name();
        } catch (IllegalArgumentException e) {
            return Currency.TRY.name();
        }
    }
}
