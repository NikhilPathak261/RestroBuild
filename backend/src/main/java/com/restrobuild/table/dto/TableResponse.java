package com.restrobuild.table.dto;

public record TableResponse(
        Long id,
        Integer tableNumber,
        String qrCodeUrl,
        boolean active
) {
}
