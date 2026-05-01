package com.caglar.notification.service;

import com.caglar.notification.dto.request.ContactRequestDto;

public interface ContactService {

    void submit(ContactRequestDto dto);
}
