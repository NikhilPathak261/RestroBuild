package com.restrobuild.restaurant.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateRestaurantRequest(
        @NotBlank(message = "Restaurant name is required.")
        @Size(max = 100, message = "Restaurant name must be at most 100 characters.")
        String name,

        @Size(max = 1000, message = "Description must be at most 1000 characters.")
        String description,

        @NotBlank(message = "Address is required.")
        String address,

        @NotBlank(message = "Phone is required.")
        String phone,

        @NotBlank(message = "Email is required.")
        @Email(message = "Email must be valid.")
        String email,

        @NotBlank(message = "Opening hours are required.")
        String openingHours,

        @Size(max = 1000, message = "Logo URL must be at most 1000 characters.")
        String logoUrl,

        @Size(max = 1000, message = "Cover image URL must be at most 1000 characters.")
        String coverImageUrl
) {
}
