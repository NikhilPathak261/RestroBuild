package com.restrobuild.menu.controller;

import com.restrobuild.common.ApiResponse;
import com.restrobuild.menu.dto.AvailabilityRequest;
import com.restrobuild.menu.dto.MenuItemRequest;
import com.restrobuild.menu.dto.MenuItemResponse;
import com.restrobuild.menu.entity.FoodType;
import com.restrobuild.menu.service.MenuItemService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class MenuItemController {

    private final MenuItemService menuItemService;

    public MenuItemController(MenuItemService menuItemService) {
        this.menuItemService = menuItemService;
    }

    @PostMapping("/api/menu-items")
    @PreAuthorize("hasAuthority('ROLE_OWNER')")
    public ResponseEntity<ApiResponse<MenuItemResponse>> createMenuItem(
            @Valid @RequestBody MenuItemRequest request
    ) {
        MenuItemResponse response = menuItemService.createMenuItem(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Menu item created successfully.", response));
    }

    @GetMapping("/api/menu-items")
    @PreAuthorize("hasAuthority('ROLE_OWNER')")
    public ResponseEntity<ApiResponse<List<MenuItemResponse>>> getMenuItems() {
        List<MenuItemResponse> response = menuItemService.getMyMenuItems();
        return ResponseEntity.ok(ApiResponse.success("Menu items fetched successfully.", response));
    }

    @GetMapping("/api/menu-items/{menuItemId}")
    @PreAuthorize("hasAuthority('ROLE_OWNER')")
    public ResponseEntity<ApiResponse<MenuItemResponse>> getMenuItem(@PathVariable Long menuItemId) {
        MenuItemResponse response = menuItemService.getMyMenuItem(menuItemId);
        return ResponseEntity.ok(ApiResponse.success("Menu item fetched successfully.", response));
    }

    @PutMapping("/api/menu-items/{menuItemId}")
    @PreAuthorize("hasAuthority('ROLE_OWNER')")
    public ResponseEntity<ApiResponse<MenuItemResponse>> updateMenuItem(
            @PathVariable Long menuItemId,
            @Valid @RequestBody MenuItemRequest request
    ) {
        MenuItemResponse response = menuItemService.updateMenuItem(menuItemId, request);
        return ResponseEntity.ok(ApiResponse.success("Menu item updated successfully.", response));
    }

    @DeleteMapping("/api/menu-items/{menuItemId}")
    @PreAuthorize("hasAuthority('ROLE_OWNER')")
    public ResponseEntity<ApiResponse<Void>> deleteMenuItem(@PathVariable Long menuItemId) {
        menuItemService.deleteMenuItem(menuItemId);
        return ResponseEntity.ok(ApiResponse.success("Menu item deleted successfully."));
    }

    @PatchMapping("/api/menu-items/{menuItemId}/hide")
    @PreAuthorize("hasAuthority('ROLE_OWNER')")
    public ResponseEntity<ApiResponse<MenuItemResponse>> hideMenuItem(@PathVariable Long menuItemId) {
        MenuItemResponse response = menuItemService.hideMenuItem(menuItemId);
        return ResponseEntity.ok(ApiResponse.success("Menu item hidden successfully.", response));
    }

    @PatchMapping("/api/menu-items/{menuItemId}/show")
    @PreAuthorize("hasAuthority('ROLE_OWNER')")
    public ResponseEntity<ApiResponse<MenuItemResponse>> showMenuItem(@PathVariable Long menuItemId) {
        MenuItemResponse response = menuItemService.showMenuItem(menuItemId);
        return ResponseEntity.ok(ApiResponse.success("Menu item shown successfully.", response));
    }

    @PatchMapping("/api/menu-items/{menuItemId}/availability")
    @PreAuthorize("hasAuthority('ROLE_OWNER')")
    public ResponseEntity<ApiResponse<MenuItemResponse>> updateAvailability(
            @PathVariable Long menuItemId,
            @Valid @RequestBody AvailabilityRequest request
    ) {
        MenuItemResponse response = menuItemService.updateAvailability(menuItemId, request);
        return ResponseEntity.ok(ApiResponse.success("Availability updated successfully.", response));
    }

    @GetMapping("/api/public/{restaurantSlug}/menu")
    public ResponseEntity<ApiResponse<List<MenuItemResponse>>> getPublicMenu(@PathVariable String restaurantSlug) {
        List<MenuItemResponse> response = menuItemService.getPublicMenu(restaurantSlug);
        return ResponseEntity.ok(ApiResponse.success("Menu fetched successfully.", response));
    }

    @GetMapping("/api/public/{restaurantSlug}/menu/{menuItemId}")
    public ResponseEntity<ApiResponse<MenuItemResponse>> getPublicMenuItem(
            @PathVariable String restaurantSlug,
            @PathVariable Long menuItemId
    ) {
        MenuItemResponse response = menuItemService.getPublicMenuItem(restaurantSlug, menuItemId);
        return ResponseEntity.ok(ApiResponse.success("Menu item fetched successfully.", response));
    }

    @GetMapping("/api/public/{restaurantSlug}/menu/search")
    public ResponseEntity<ApiResponse<List<MenuItemResponse>>> searchPublicMenu(
            @PathVariable String restaurantSlug,
            @RequestParam(required = false) String keyword
    ) {
        List<MenuItemResponse> response = menuItemService.searchPublicMenu(restaurantSlug, keyword);
        return ResponseEntity.ok(ApiResponse.success("Menu search completed successfully.", response));
    }

    @GetMapping("/api/public/{restaurantSlug}/menu/filter")
    public ResponseEntity<ApiResponse<List<MenuItemResponse>>> filterPublicMenu(
            @PathVariable String restaurantSlug,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) FoodType foodType,
            @RequestParam(required = false) Integer spicyLevel,
            @RequestParam(required = false) Integer sweetLevel
    ) {
        List<MenuItemResponse> response = menuItemService.filterPublicMenu(
                restaurantSlug,
                categoryId,
                foodType,
                spicyLevel,
                sweetLevel
        );
        return ResponseEntity.ok(ApiResponse.success("Menu filtered successfully.", response));
    }

    @GetMapping("/api/public/{restaurantSlug}/menu/sort")
    public ResponseEntity<ApiResponse<List<MenuItemResponse>>> sortPublicMenu(
            @PathVariable String restaurantSlug,
            @RequestParam(defaultValue = "PRICE_ASC") String sortBy
    ) {
        List<MenuItemResponse> response = menuItemService.sortPublicMenu(restaurantSlug, sortBy);
        return ResponseEntity.ok(ApiResponse.success("Menu sorted successfully.", response));
    }
}
