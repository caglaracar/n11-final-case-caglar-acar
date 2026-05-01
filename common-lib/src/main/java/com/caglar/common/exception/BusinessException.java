package com.caglar.common.exception;

import lombok.Getter;

@Getter
public class BusinessException extends RuntimeException {

    private final ErrorType errorType;
    private final transient Object detail;

    public BusinessException(ErrorType errorType) {
        super(errorType.getMessage());
        this.errorType = errorType;
        this.detail = null;
    }

    public BusinessException(ErrorType errorType, String customMessage) {
        super(customMessage);
        this.errorType = errorType;
        this.detail = null;
    }

    public BusinessException(ErrorType errorType, String customMessage, Object detail) {
        super(customMessage);
        this.errorType = errorType;
        this.detail = detail;
    }
}
