package com.caglar.common.exception;

import org.springframework.http.HttpStatus;

public enum ErrorType {

    // 1xxx — generic
    INTERNAL_ERROR(1000, "Beklenmeyen bir hata oluştu", HttpStatus.INTERNAL_SERVER_ERROR),
    VALIDATION_ERROR(1001, "Validation hatası", HttpStatus.BAD_REQUEST),
    INVALID_ARGUMENT(1002, "Geçersiz istek", HttpStatus.BAD_REQUEST),
    NOT_FOUND(1003, "Kayıt bulunamadı", HttpStatus.NOT_FOUND),
    ACCESS_DENIED(1004, "Bu işlem için yetkiniz yok", HttpStatus.FORBIDDEN),
    UNAUTHORIZED(1005, "Kimlik doğrulanamadı", HttpStatus.UNAUTHORIZED),

    // 2xxx — auth
    USER_ALREADY_EXISTS(2001, "Kullanıcı zaten kayıtlı", HttpStatus.CONFLICT),
    INVALID_CREDENTIALS(2002, "Kullanıcı adı veya şifre hatalı", HttpStatus.UNAUTHORIZED),
    PASSWORDS_DO_NOT_MATCH(2003, "Şifreler eşleşmiyor", HttpStatus.BAD_REQUEST),
    INVALID_TOKEN(2004, "Geçersiz veya süresi dolmuş token", HttpStatus.UNAUTHORIZED),
    REFRESH_TOKEN_REVOKED(2005, "Refresh token iptal edilmiş", HttpStatus.UNAUTHORIZED),

    // 3xxx — user
    USER_NOT_FOUND(3001, "Kullanıcı bulunamadı", HttpStatus.NOT_FOUND),
    ADDRESS_NOT_FOUND(3002, "Adres bulunamadı", HttpStatus.NOT_FOUND),

    // 4xxx — product
    PRODUCT_NOT_FOUND(4001, "Ürün bulunamadı", HttpStatus.NOT_FOUND),
    PRODUCT_OUT_OF_STOCK(4002, "Ürün stokta yok", HttpStatus.CONFLICT),
    CATEGORY_NOT_FOUND(4003, "Kategori bulunamadı", HttpStatus.NOT_FOUND),
    BRAND_NOT_FOUND(4004, "Marka bulunamadı", HttpStatus.NOT_FOUND),
    REVIEW_NOT_FOUND(4005, "Değerlendirme bulunamadı", HttpStatus.NOT_FOUND),
    DUPLICATE_REVIEW(4006, "Bu ürün için zaten değerlendirme yapıldı", HttpStatus.CONFLICT),

    // 5xxx — basket
    BASKET_NOT_FOUND(5001, "Sepet bulunamadı", HttpStatus.NOT_FOUND),
    BASKET_ITEM_NOT_FOUND(5002, "Sepet ürünü bulunamadı", HttpStatus.NOT_FOUND),

    // 6xxx — order
    ORDER_NOT_FOUND(6001, "Sipariş bulunamadı", HttpStatus.NOT_FOUND),
    ORDER_ALREADY_CANCELLED(6002, "Sipariş zaten iptal edilmiş", HttpStatus.CONFLICT),
    ORDER_CANNOT_BE_CANCELLED(6003, "Bu durumdaki sipariş iptal edilemez", HttpStatus.UNPROCESSABLE_ENTITY),

    // 7xxx — payment
    PAYMENT_NOT_FOUND(7001, "Ödeme bulunamadı", HttpStatus.NOT_FOUND),
    PAYMENT_FAILED(7002, "Ödeme işlemi başarısız", HttpStatus.PAYMENT_REQUIRED),
    PAYMENT_ALREADY_PROCESSED(7003, "Ödeme zaten işlenmiş", HttpStatus.CONFLICT);

    private final int code;
    private final String message;
    private final HttpStatus httpStatus;

    ErrorType(int code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }

    public int getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }

    public HttpStatus getHttpStatus() {
        return httpStatus;
    }
}
