package com.restrobuild.category.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CategoryRequest(
        @NotBlank(message = "Category name is required.")
        @Size(max = 50, message = "Category name must be at most 50 characters.")
        String name,

        @NotNull(message = "Display order is required.")
        @Min(value = 0, message = "Display order cannot be negative.")
        Integer displayOrder
) {
}
