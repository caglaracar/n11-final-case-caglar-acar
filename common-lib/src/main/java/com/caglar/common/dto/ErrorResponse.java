package com.caglar.common.dto;

public record ErrorResponse(
        String hostName,
        String path,
        Long createdAt,
        String message,
        Integer code,
        Object detail
) {}
