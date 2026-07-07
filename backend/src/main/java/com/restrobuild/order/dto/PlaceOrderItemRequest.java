package com.restrobuild.order.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record PlaceOrderItemRequest(
        @NotNull(message = "Menu item is required.")
        Long menuItemId,

        @NotNull(message = "Quantity is required.")
        @Min(value = 1, message = "Quantity must be at least 1.")
        @Max(value = 99, message = "Quantity cannot exceed 99.")
        Integer quantity
) {
}
