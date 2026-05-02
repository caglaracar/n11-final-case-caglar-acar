package com.caglar.payment.service.impl;

import com.caglar.payment.dto.request.InitCheckoutRequestDto;
import com.caglar.payment.mapper.IyzicoRequestMapper;
import com.caglar.payment.service.IyzicoService;
import com.iyzipay.Options;
import com.iyzipay.model.CheckoutForm;
import com.iyzipay.model.CheckoutFormInitialize;
import com.iyzipay.model.Status;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * iyzipay-java SDK üzerine ince bir sarmalayıcı.
 * Tüm DTO → SDK dönüşümleri {@link IyzicoRequestMapper}'da; burada sadece çağrı + sonuç değerlendirme.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class IyzicoServiceImpl implements IyzicoService {

    private static final String IYZICO_STATUS_SUCCESS = Status.SUCCESS.getValue();
    private static final String PAYMENT_STATUS_SUCCESS = "SUCCESS";

    private final Options options;

    @Override
    public Result initialize(InitCheckoutRequestDto dto, String callbackUrl) {
        CheckoutFormInitialize response = CheckoutFormInitialize.create(
                IyzicoRequestMapper.toInitializeRequest(dto, callbackUrl), options);

        if (!IYZICO_STATUS_SUCCESS.equals(response.getStatus())) {
            log.warn("Iyzico initialize failed orderId={} status={} errorCode={} errorMessage={}",
                    dto.orderId(), response.getStatus(), response.getErrorCode(), response.getErrorMessage());
            return new Result(false, null, null, null, response.getErrorMessage());
        }
        return new Result(true, response.getPaymentPageUrl(), response.getToken(), null, null);
    }

    @Override
    public Result retrieve(String token, Long orderId) {
        CheckoutForm response = CheckoutForm.retrieve(
                IyzicoRequestMapper.toRetrieveRequest(token, orderId), options);

        if (!IYZICO_STATUS_SUCCESS.equals(response.getStatus())) {
            String message = response.getErrorMessage() != null
                    ? response.getErrorMessage()
                    : "Iyzico status=" + response.getStatus();
            return new Result(false, null, token, null, message);
        }
        if (!PAYMENT_STATUS_SUCCESS.equals(response.getPaymentStatus())) {
            return new Result(false, null, token, response.getPaymentId(),
                    "paymentStatus=" + response.getPaymentStatus());
        }
        return new Result(true, null, token, response.getPaymentId(), null);
    }
}
