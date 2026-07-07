package com.restrobuild.restaurant.controller;

import com.restrobuild.common.ApiResponse;
import com.restrobuild.restaurant.dto.CreateRestaurantRequest;
import com.restrobuild.restaurant.dto.RestaurantResponse;
import com.restrobuild.restaurant.dto.UpdateRestaurantRequest;
import com.restrobuild.restaurant.service.RestaurantService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/restaurants")
@PreAuthorize("hasAuthority('ROLE_OWNER')")
public class RestaurantController {

    private final RestaurantService restaurantService;

    public RestaurantController(RestaurantService restaurantService) {
        this.restaurantService = restaurantService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<RestaurantResponse>> createRestaurant(
            @Valid @RequestBody CreateRestaurantRequest request
    ) {
        RestaurantResponse response = restaurantService.createRestaurant(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Restaurant created successfully.", response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<RestaurantResponse>> getMyRestaurant() {
        RestaurantResponse response = restaurantService.getMyRestaurant();
        return ResponseEntity.ok(ApiResponse.success("Restaurant fetched successfully.", response));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<RestaurantResponse>> updateMyRestaurant(
            @Valid @RequestBody UpdateRestaurantRequest request
    ) {
        RestaurantResponse response = restaurantService.updateMyRestaurant(request);
        return ResponseEntity.ok(ApiResponse.success("Restaurant updated successfully.", response));
    }
}
