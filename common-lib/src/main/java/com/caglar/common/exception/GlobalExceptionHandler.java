package com.caglar.common.exception;

import com.caglar.common.dto.BaseResponse;
import com.caglar.common.dto.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<BaseResponse<ErrorResponse>> handleBusiness(BusinessException ex,
                                                                      HttpServletRequest request) {
        ErrorType type = ex.getErrorType();
        log.warn("BusinessException [code={}] {}", type.getCode(), ex.getMessage());
        ErrorResponse error = build(request, ex.getMessage(), type.getCode(), ex.getDetail());
        return ResponseEntity.status(type.getHttpStatus()).body(BaseResponse.fail(error));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<BaseResponse<ErrorResponse>> handleValidation(MethodArgumentNotValidException ex,
                                                                        HttpServletRequest request) {
        Map<String, String> fields = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(fe ->
                fields.put(fe.getField(), fe.getDefaultMessage()));
        ErrorType type = ErrorType.VALIDATION_ERROR;
        ErrorResponse error = build(request, type.getMessage(), type.getCode(), fields);
        return ResponseEntity.status(type.getHttpStatus()).body(BaseResponse.fail(error));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<BaseResponse<ErrorResponse>> handleAccessDenied(AccessDeniedException ex,
                                                                          HttpServletRequest request) {
        ErrorType type = ErrorType.ACCESS_DENIED;
        ErrorResponse error = build(request, type.getMessage(), type.getCode(), ex.getMessage());
        return ResponseEntity.status(type.getHttpStatus()).body(BaseResponse.fail(error));
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<BaseResponse<ErrorResponse>> handleAuthentication(AuthenticationException ex,
                                                                            HttpServletRequest request) {
        ErrorType type = ErrorType.UNAUTHORIZED;
        ErrorResponse error = build(request, type.getMessage(), type.getCode(), ex.getMessage());
        return ResponseEntity.status(type.getHttpStatus()).body(BaseResponse.fail(error));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<BaseResponse<ErrorResponse>> handleGeneric(Exception ex,
                                                                     HttpServletRequest request) {
        log.error("Unhandled exception", ex);
        ErrorType type = ErrorType.INTERNAL_ERROR;
        ErrorResponse error = build(request, ex.getMessage(), type.getCode(), null);
        return ResponseEntity.status(type.getHttpStatus()).body(BaseResponse.fail(error));
    }

    private ErrorResponse build(HttpServletRequest request, String message, int code, Object detail) {
        return new ErrorResponse(
                resolveHostName(),
                request.getRequestURI(),
                Instant.now().toEpochMilli(),
                message,
                code,
                detail
        );
    }

    private String resolveHostName() {
        try {
            return InetAddress.getLocalHost().getHostName();
        } catch (UnknownHostException e) {
            return "unknown";
        }
    }
}
