package com.caglar.notification.controller;

import com.caglar.common.dto.BaseResponse;
import com.caglar.notification.dto.request.ContactRequestDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;

@Tag(name = "Contact", description = "İletişim formu")
public interface IContactApi {

    @Operation(summary = "İletişim formu gönder (public)")
    ResponseEntity<BaseResponse<Boolean>> submit(@Valid @RequestBody ContactRequestDto dto);
}
