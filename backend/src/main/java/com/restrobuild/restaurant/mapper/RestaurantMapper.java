package com.restrobuild.restaurant.mapper;

import com.restrobuild.restaurant.dto.RestaurantResponse;
import com.restrobuild.restaurant.entity.Restaurant;
import org.springframework.stereotype.Component;

@Component
public class RestaurantMapper {

    public RestaurantResponse toResponse(Restaurant restaurant) {
        return new RestaurantResponse(
                restaurant.getId(),
                restaurant.getName(),
                restaurant.getDescription(),
                restaurant.getAddress(),
                restaurant.getPhone(),
                restaurant.getEmail(),
                restaurant.getOpeningHours(),
                restaurant.getLogoUrl(),
                restaurant.getCoverImageUrl(),
                restaurant.getPrimaryColor(),
                restaurant.getSecondaryColor(),
                restaurant.getTemplateName(),
                restaurant.isActive()
        );
    }
}
