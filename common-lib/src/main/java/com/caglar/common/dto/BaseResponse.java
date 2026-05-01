package com.caglar.common.dto;

/**
 * Tüm REST endpoint'lerinin döndüğü ortak zarf.
 */
public record BaseResponse<T>(
        boolean result,
        String errorMessage,
        T data
) {

    public static <T> BaseResponse<T> success(T data) {
        return new BaseResponse<>(true, null, data);
    }

    public static <T> BaseResponse<T> success() {
        return new BaseResponse<>(true, null, null);
    }

    public static <T> BaseResponse<T> fail(String errorMessage, T detail) {
        return new BaseResponse<>(false, errorMessage, detail);
    }

    public static BaseResponse<ErrorResponse> fail(ErrorResponse error) {
        return new BaseResponse<>(false, error.message(), error);
    }
}
