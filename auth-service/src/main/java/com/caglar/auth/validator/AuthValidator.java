package com.caglar.auth.validator;

import com.caglar.auth.config.AuthProperties;
import com.caglar.common.exception.BusinessException;
import com.caglar.common.exception.ErrorType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AuthValidator {

    private final AuthProperties.Admin adminProperties;

    public void validatePasswordsMatch(String password, String repassword) {
        if (!password.equals(repassword)) {
            throw new BusinessException(ErrorType.PASSWORDS_DO_NOT_MATCH);
        }
    }

    public void validateAdminInvite(String submittedCode) {
        if (!adminProperties.isEnabled()) {
            throw new BusinessException(ErrorType.ACCESS_DENIED, "Admin kayıt kapalı");
        }
        if (!adminProperties.inviteCode().equals(submittedCode)) {
            throw new BusinessException(ErrorType.ACCESS_DENIED, "Geçersiz davet kodu");
        }
    }
}
