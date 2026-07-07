package com.restrobuild.website.service;

import com.restrobuild.auth.entity.Owner;
import com.restrobuild.exception.ResourceNotFoundException;
import com.restrobuild.restaurant.dto.RestaurantResponse;
import com.restrobuild.restaurant.entity.Restaurant;
import com.restrobuild.restaurant.mapper.RestaurantMapper;
import com.restrobuild.restaurant.repository.RestaurantRepository;
import com.restrobuild.security.AuthenticatedUserService;
import com.restrobuild.website.dto.PublishWebsiteResponse;
import com.restrobuild.website.dto.UpdateAboutRequest;
import com.restrobuild.website.dto.UpdateWebsiteThemeRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class WebsiteService {

    private final AuthenticatedUserService authenticatedUserService;
    private final RestaurantRepository restaurantRepository;
    private final RestaurantMapper restaurantMapper;
    private final String frontendBaseUrl;

    public WebsiteService(
            AuthenticatedUserService authenticatedUserService,
            RestaurantRepository restaurantRepository,
            RestaurantMapper restaurantMapper,
            @Value("${app.frontend.base-url}") String frontendBaseUrl
    ) {
        this.authenticatedUserService = authenticatedUserService;
        this.restaurantRepository = restaurantRepository;
        this.restaurantMapper = restaurantMapper;
        this.frontendBaseUrl = frontendBaseUrl;
    }

    @Transactional(readOnly = true)
    public RestaurantResponse getWebsiteSettings() {
        return restaurantMapper.toResponse(getCurrentOwnerRestaurant());
    }

    @Transactional
    public RestaurantResponse updateTheme(UpdateWebsiteThemeRequest request) {
        Restaurant restaurant = getCurrentOwnerRestaurant();
        restaurant.updateTheme(
                request.template().trim().toUpperCase(),
                request.primaryColor().trim(),
                request.secondaryColor().trim()
        );

        return restaurantMapper.toResponse(restaurant);
    }

    @Transactional
    public RestaurantResponse updateAbout(UpdateAboutRequest request) {
        Restaurant restaurant = getCurrentOwnerRestaurant();
        restaurant.updateAbout(request.about().trim());

        return restaurantMapper.toResponse(restaurant);
    }

    @Transactional
    public PublishWebsiteResponse publishWebsite() {
        Restaurant restaurant = getCurrentOwnerRestaurant();
        restaurant.publish();

        return new PublishWebsiteResponse(frontendBaseUrl + "/r/" + restaurant.getSlug());
    }

    @Transactional(readOnly = true)
    public RestaurantResponse getPublicWebsite(String slug) {
        Restaurant restaurant = restaurantRepository.findBySlugAndPublishedTrueAndActiveTrue(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant website not found."));

        return restaurantMapper.toResponse(restaurant);
    }

    private Restaurant getCurrentOwnerRestaurant() {
        Owner owner = authenticatedUserService.getAuthenticatedOwner();
        if (owner.getRestaurant() == null) {
            throw new ResourceNotFoundException("Restaurant profile not found.");
        }

        return owner.getRestaurant();
    }
}
