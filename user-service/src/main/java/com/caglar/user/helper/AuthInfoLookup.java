package com.caglar.user.helper;

import com.caglar.common.dto.BaseResponse;
import com.caglar.common.exception.BusinessException;
import com.caglar.common.exception.ErrorType;
import com.caglar.user.dto.response.AuthInfoResponseDto;
import com.caglar.user.client.AuthServiceClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

/**
 * auth-service Feign çağrısını sarar; servis katmanı sadece bu helper'a {@code authId}
 * verir, ResponseEntity / BaseResponse açma derdi yaşamaz. Ağ hataları
 * {@link ErrorType#USER_NOT_FOUND} olarak yüzdürülür.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AuthInfoLookup {

    private final AuthServiceClient authServiceClient;

    public AuthInfoResponseDto require(Long authId) {
        try {
            return unwrap(authServiceClient.getByAuthId(authId));
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.warn("auth-service findByAuthId çağrısı başarısız (authId={}): {}", authId, e.getMessage());
            throw new BusinessException(ErrorType.USER_NOT_FOUND);
        }
    }

    private AuthInfoResponseDto unwrap(ResponseEntity<BaseResponse<AuthInfoResponseDto>> resp) {
        AuthInfoResponseDto info = resp.getBody() != null ? resp.getBody().data() : null;
        if (info == null) {
            throw new BusinessException(ErrorType.USER_NOT_FOUND);
        }
        return info;
    }
}
