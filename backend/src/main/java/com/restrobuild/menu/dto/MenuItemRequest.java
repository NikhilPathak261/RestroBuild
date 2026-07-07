package com.restrobuild.menu.dto;

import com.restrobuild.menu.entity.FoodType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record MenuItemRequest(
        @NotNull(message = "Category is required.")
        Long categoryId,

        @NotBlank(message = "Menu item name is required.")
        @Size(max = 100, message = "Menu item name must be at most 100 characters.")
        String name,

        @Size(max = 1000, message = "Description must be at most 1000 characters.")
        String description,

        @NotNull(message = "Price is required.")
        @DecimalMin(value = "0.01", message = "Price must be greater than zero.")
        BigDecimal price,

        String imageUrl,

        @NotNull(message = "Food type is required.")
        FoodType foodType,

        @NotNull(message = "Spicy level is required.")
        @Min(value = 0, message = "Spicy level must be between 0 and 3.")
        @Max(value = 3, message = "Spicy level must be between 0 and 3.")
        Integer spicyLevel,

        @NotNull(message = "Sweet level is required.")
        @Min(value = 0, message = "Sweet level must be between 0 and 3.")
        @Max(value = 3, message = "Sweet level must be between 0 and 3.")
        Integer sweetLevel,

        @NotNull(message = "Preparation time is required.")
        @Min(value = 1, message = "Preparation time must be at least 1 minute.")
        Integer preparationTime,

        @NotNull(message = "Availability is required.")
        Boolean available
) {
}
