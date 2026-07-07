package com.restrobuild.restaurant.dto;

public record RestaurantResponse(
        Long id,
        String name,
        String description,
        String address,
        String phone,
        String email,
        String openingHours,
        String logoUrl,
        String coverImageUrl,
        String primaryColor,
        String secondaryColor,
        String templateName,
        boolean active
) {
}
