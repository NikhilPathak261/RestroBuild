package com.restrobuild.restaurant.service;

import com.restrobuild.auth.entity.Owner;
import com.restrobuild.exception.BusinessException;
import com.restrobuild.exception.ResourceNotFoundException;
import com.restrobuild.restaurant.dto.CreateRestaurantRequest;
import com.restrobuild.restaurant.dto.RestaurantResponse;
import com.restrobuild.restaurant.dto.UpdateRestaurantRequest;
import com.restrobuild.restaurant.entity.Restaurant;
import com.restrobuild.restaurant.mapper.RestaurantMapper;
import com.restrobuild.restaurant.repository.RestaurantRepository;
import com.restrobuild.security.AuthenticatedUserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RestaurantService {

    private final RestaurantRepository restaurantRepository;
    private final AuthenticatedUserService authenticatedUserService;
    private final RestaurantMapper restaurantMapper;

    public RestaurantService(
            RestaurantRepository restaurantRepository,
            AuthenticatedUserService authenticatedUserService,
            RestaurantMapper restaurantMapper
    ) {
        this.restaurantRepository = restaurantRepository;
        this.authenticatedUserService = authenticatedUserService;
        this.restaurantMapper = restaurantMapper;
    }

    @Transactional
    public RestaurantResponse createRestaurant(CreateRestaurantRequest request) {
        Owner owner = authenticatedUserService.getAuthenticatedOwner();
        if (owner.getRestaurant() != null) {
            throw new BusinessException("Restaurant profile already exists for this owner.");
        }

        String email = normalize(request.email());
        if (restaurantRepository.existsByEmailIgnoreCase(email)) {
            throw new BusinessException("Restaurant email already exists.");
        }

        Restaurant restaurant = new Restaurant(
                request.name().trim(),
                trimNullable(request.description()),
                request.address().trim(),
                request.phone().trim(),
                email,
                request.openingHours().trim(),
                generateUniqueSlug(request.name())
        );

        Restaurant savedRestaurant = restaurantRepository.save(restaurant);
        owner.assignRestaurant(savedRestaurant);

        return restaurantMapper.toResponse(savedRestaurant);
    }

    @Transactional(readOnly = true)
    public RestaurantResponse getMyRestaurant() {
        Restaurant restaurant = getCurrentOwnerRestaurant();
        return restaurantMapper.toResponse(restaurant);
    }

    @Transactional
    public RestaurantResponse updateMyRestaurant(UpdateRestaurantRequest request) {
        Restaurant restaurant = getCurrentOwnerRestaurant();
        String email = normalize(request.email());

        if (restaurantRepository.existsByEmailIgnoreCaseAndIdNot(email, restaurant.getId())) {
            throw new BusinessException("Restaurant email already exists.");
        }

        restaurant.updateProfile(
                request.name().trim(),
                trimNullable(request.description()),
                request.address().trim(),
                request.phone().trim(),
                email,
                request.openingHours().trim()
        );

        return restaurantMapper.toResponse(restaurant);
    }

    private Restaurant getCurrentOwnerRestaurant() {
        Owner owner = authenticatedUserService.getAuthenticatedOwner();
        if (owner.getRestaurant() == null) {
            throw new ResourceNotFoundException("Restaurant profile not found.");
        }

        return owner.getRestaurant();
    }

    private String normalize(String value) {
        return value.trim().toLowerCase();
    }

    private String trimNullable(String value) {
        return value == null ? null : value.trim();
    }

    private String generateUniqueSlug(String name) {
        String baseSlug = name.trim()
                .toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");

        if (baseSlug.isBlank()) {
            baseSlug = "restaurant";
        }

        String slug = baseSlug;
        int counter = 2;
        while (restaurantRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + counter;
            counter++;
        }

        return slug;
    }
}
