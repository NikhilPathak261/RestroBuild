package com.restrobuild.menu.dto;

import com.restrobuild.menu.entity.FoodType;

import java.math.BigDecimal;

public record MenuItemResponse(
        Long id,
        Long categoryId,
        String categoryName,
        String name,
        String description,
        BigDecimal price,
        String imageUrl,
        FoodType foodType,
        Integer spicyLevel,
        Integer sweetLevel,
        Integer preparationTime,
        boolean available,
        boolean hidden
) {
}
