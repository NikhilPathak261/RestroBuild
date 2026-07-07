package com.restrobuild.table.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record UpdateTableRequest(
        @NotNull(message = "Table number is required.")
        @Min(value = 1, message = "Table number must be positive.")
        Integer tableNumber
) {
}
