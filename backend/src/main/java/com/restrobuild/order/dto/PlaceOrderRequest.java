package com.restrobuild.order.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record PlaceOrderRequest(
        @NotNull(message = "Table is required.")
        Long tableId,

        @Valid
        @NotEmpty(message = "Order must contain at least one item.")
        List<PlaceOrderItemRequest> items,

        @Size(max = 500, message = "Special instructions must be at most 500 characters.")
        String specialInstructions
) {
}
