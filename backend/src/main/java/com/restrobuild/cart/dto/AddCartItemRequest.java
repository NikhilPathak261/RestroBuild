package com.restrobuild.cart.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AddCartItemRequest(
        @NotNull(message = "Menu item is required.")
        Long menuItemId,

        @NotNull(message = "Quantity is required.")
        @Min(value = 1, message = "Quantity must be at least 1.")
        @Max(value = 99, message = "Quantity cannot exceed 99.")
        Integer quantity,

        @Size(max = 500, message = "Special instructions must be at most 500 characters.")
        String specialInstructions
) {
}
