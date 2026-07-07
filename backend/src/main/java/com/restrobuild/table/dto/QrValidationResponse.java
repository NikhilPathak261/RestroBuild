package com.restrobuild.table.dto;

public record QrValidationResponse(
        Long restaurantId,
        String restaurantName,
        String restaurantSlug,
        Long tableId,
        Integer tableNumber
) {
}
