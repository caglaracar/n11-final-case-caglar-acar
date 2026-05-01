package com.caglar.common.controller;

import com.caglar.common.dto.BaseResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

/**
 * Controller'ların extend edebileceği ortak helper.
 * Hedef: ResponseEntity<BaseResponse<T>> kalıbını tek noktada üretmek.
 */
public abstract class BaseController {

    protected <T> ResponseEntity<BaseResponse<T>> ok(T data) {
        return ResponseEntity.ok(BaseResponse.success(data));
    }

    protected ResponseEntity<BaseResponse<Void>> ok() {
        return ResponseEntity.ok(BaseResponse.success());
    }

    protected <T> ResponseEntity<BaseResponse<T>> created(T data) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(BaseResponse.success(data));
    }

    protected <T> ResponseEntity<BaseResponse<T>> noContent() {
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
