package com.restrobuild.website.controller;

import com.restrobuild.common.ApiResponse;
import com.restrobuild.restaurant.dto.RestaurantResponse;
import com.restrobuild.website.dto.PublishWebsiteResponse;
import com.restrobuild.website.dto.UpdateAboutRequest;
import com.restrobuild.website.dto.UpdateWebsiteThemeRequest;
import com.restrobuild.website.service.WebsiteService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class WebsiteController {

    private final WebsiteService websiteService;

    public WebsiteController(WebsiteService websiteService) {
        this.websiteService = websiteService;
    }

    @GetMapping("/api/website")
    @PreAuthorize("hasAuthority('ROLE_OWNER')")
    public ResponseEntity<ApiResponse<RestaurantResponse>> getWebsiteSettings() {
        RestaurantResponse response = websiteService.getWebsiteSettings();
        return ResponseEntity.ok(ApiResponse.success("Website settings fetched successfully.", response));
    }

    @PutMapping("/api/website/theme")
    @PreAuthorize("hasAuthority('ROLE_OWNER')")
    public ResponseEntity<ApiResponse<RestaurantResponse>> updateTheme(
            @Valid @RequestBody UpdateWebsiteThemeRequest request
    ) {
        RestaurantResponse response = websiteService.updateTheme(request);
        return ResponseEntity.ok(ApiResponse.success("Website theme updated successfully.", response));
    }

    @PutMapping("/api/website/about")
    @PreAuthorize("hasAuthority('ROLE_OWNER')")
    public ResponseEntity<ApiResponse<RestaurantResponse>> updateAbout(
            @Valid @RequestBody UpdateAboutRequest request
    ) {
        RestaurantResponse response = websiteService.updateAbout(request);
        return ResponseEntity.ok(ApiResponse.success("About section updated successfully.", response));
    }

    @PostMapping("/api/website/publish")
    @PreAuthorize("hasAuthority('ROLE_OWNER')")
    public ResponseEntity<ApiResponse<PublishWebsiteResponse>> publishWebsite() {
        PublishWebsiteResponse response = websiteService.publishWebsite();
        return ResponseEntity.ok(ApiResponse.success("Website published successfully.", response));
    }

    @GetMapping({
            "/api/public/{restaurantSlug}",
            "/api/public/{restaurantSlug}/home",
            "/api/public/{restaurantSlug}/about",
            "/api/public/{restaurantSlug}/contact"
    })
    public ResponseEntity<ApiResponse<RestaurantResponse>> getPublicWebsite(
            @PathVariable String restaurantSlug
    ) {
        RestaurantResponse response = websiteService.getPublicWebsite(restaurantSlug);
        return ResponseEntity.ok(ApiResponse.success("Restaurant website fetched successfully.", response));
    }
}
