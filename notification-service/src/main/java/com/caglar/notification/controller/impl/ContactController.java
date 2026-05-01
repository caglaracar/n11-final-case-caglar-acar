package com.caglar.notification.controller.impl;

import com.caglar.common.controller.BaseController;
import com.caglar.common.dto.BaseResponse;
import com.caglar.notification.controller.IContactApi;
import com.caglar.notification.dto.request.ContactRequestDto;
import com.caglar.notification.service.ContactService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static com.caglar.common.constant.RestApis.CONTACT;

@RestController
@RequestMapping(CONTACT)
@RequiredArgsConstructor
public class ContactController extends BaseController implements IContactApi {

    private final ContactService contactService;

    @Override
    @PostMapping("/submit")
    public ResponseEntity<BaseResponse<Boolean>> submit(@Valid @RequestBody ContactRequestDto dto) {
        contactService.submit(dto);
        return ok(Boolean.TRUE);
    }
}
