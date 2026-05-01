package com.caglar.common.dto;

/**
 * Ortak hata response formatı.
 */
public record ErrorResponse(
        String hostName,
        String path,
        Long createdAt,
        String message,
        Integer code,
        Object detail
) {}
