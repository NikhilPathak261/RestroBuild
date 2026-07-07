package com.restrobuild.menu.service;

import com.restrobuild.category.entity.Category;
import com.restrobuild.category.repository.CategoryRepository;
import com.restrobuild.exception.ResourceNotFoundException;
import com.restrobuild.menu.dto.AvailabilityRequest;
import com.restrobuild.menu.dto.MenuItemRequest;
import com.restrobuild.menu.dto.MenuItemResponse;
import com.restrobuild.menu.entity.FoodType;
import com.restrobuild.menu.entity.MenuItem;
import com.restrobuild.menu.mapper.MenuItemMapper;
import com.restrobuild.menu.repository.MenuItemRepository;
import com.restrobuild.restaurant.entity.Restaurant;
import com.restrobuild.restaurant.repository.RestaurantRepository;
import com.restrobuild.security.AuthenticatedUserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
public class MenuItemService {

    private final MenuItemRepository menuItemRepository;
    private final CategoryRepository categoryRepository;
    private final RestaurantRepository restaurantRepository;
    private final AuthenticatedUserService authenticatedUserService;
    private final MenuItemMapper menuItemMapper;

    public MenuItemService(
            MenuItemRepository menuItemRepository,
            CategoryRepository categoryRepository,
            RestaurantRepository restaurantRepository,
            AuthenticatedUserService authenticatedUserService,
            MenuItemMapper menuItemMapper
    ) {
        this.menuItemRepository = menuItemRepository;
        this.categoryRepository = categoryRepository;
        this.restaurantRepository = restaurantRepository;
        this.authenticatedUserService = authenticatedUserService;
        this.menuItemMapper = menuItemMapper;
    }

    @Transactional
    public MenuItemResponse createMenuItem(MenuItemRequest request) {
        Restaurant restaurant = authenticatedUserService.getAuthenticatedOwnerRestaurant();
        Category category = getOwnerCategory(request.categoryId(), restaurant.getId());

        MenuItem menuItem = new MenuItem(
                restaurant,
                category,
                request.name().trim(),
                trimNullable(request.description()),
                request.price(),
                trimNullable(request.imageUrl()),
                request.foodType(),
                request.spicyLevel(),
                request.sweetLevel(),
                request.preparationTime(),
                request.available()
        );

        return menuItemMapper.toResponse(menuItemRepository.save(menuItem));
    }

    @Transactional(readOnly = true)
    public List<MenuItemResponse> getMyMenuItems() {
        Restaurant restaurant = authenticatedUserService.getAuthenticatedOwnerRestaurant();
        return menuItemRepository.findByRestaurantIdOrderByNameAsc(restaurant.getId())
                .stream()
                .map(menuItemMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public MenuItemResponse getMyMenuItem(Long menuItemId) {
        Restaurant restaurant = authenticatedUserService.getAuthenticatedOwnerRestaurant();
        return menuItemMapper.toResponse(getOwnerMenuItem(menuItemId, restaurant.getId()));
    }

    @Transactional
    public MenuItemResponse updateMenuItem(Long menuItemId, MenuItemRequest request) {
        Restaurant restaurant = authenticatedUserService.getAuthenticatedOwnerRestaurant();
        MenuItem menuItem = getOwnerMenuItem(menuItemId, restaurant.getId());
        Category category = getOwnerCategory(request.categoryId(), restaurant.getId());

        menuItem.update(
                category,
                request.name().trim(),
                trimNullable(request.description()),
                request.price(),
                trimNullable(request.imageUrl()),
                request.foodType(),
                request.spicyLevel(),
                request.sweetLevel(),
                request.preparationTime(),
                request.available()
        );

        return menuItemMapper.toResponse(menuItem);
    }

    @Transactional
    public void deleteMenuItem(Long menuItemId) {
        Restaurant restaurant = authenticatedUserService.getAuthenticatedOwnerRestaurant();
        getOwnerMenuItem(menuItemId, restaurant.getId()).hide();
    }

    @Transactional
    public MenuItemResponse hideMenuItem(Long menuItemId) {
        Restaurant restaurant = authenticatedUserService.getAuthenticatedOwnerRestaurant();
        MenuItem menuItem = getOwnerMenuItem(menuItemId, restaurant.getId());
        menuItem.hide();
        return menuItemMapper.toResponse(menuItem);
    }

    @Transactional
    public MenuItemResponse showMenuItem(Long menuItemId) {
        Restaurant restaurant = authenticatedUserService.getAuthenticatedOwnerRestaurant();
        MenuItem menuItem = getOwnerMenuItem(menuItemId, restaurant.getId());
        menuItem.show();
        return menuItemMapper.toResponse(menuItem);
    }

    @Transactional
    public MenuItemResponse updateAvailability(Long menuItemId, AvailabilityRequest request) {
        Restaurant restaurant = authenticatedUserService.getAuthenticatedOwnerRestaurant();
        MenuItem menuItem = getOwnerMenuItem(menuItemId, restaurant.getId());
        menuItem.updateAvailability(request.available());
        return menuItemMapper.toResponse(menuItem);
    }

    @Transactional(readOnly = true)
    public List<MenuItemResponse> getPublicMenu(String restaurantSlug) {
        Restaurant restaurant = getPublishedRestaurant(restaurantSlug);
        return map(menuItemRepository.findByRestaurantIdAndHiddenFalseAndAvailableTrueOrderByNameAsc(restaurant.getId()));
    }

    @Transactional(readOnly = true)
    public MenuItemResponse getPublicMenuItem(String restaurantSlug, Long menuItemId) {
        Restaurant restaurant = getPublishedRestaurant(restaurantSlug);
        MenuItem menuItem = menuItemRepository.findByIdAndRestaurantIdAndHiddenFalseAndAvailableTrue(
                menuItemId,
                restaurant.getId()
        ).orElseThrow(() -> new ResourceNotFoundException("Menu item not found."));

        return menuItemMapper.toResponse(menuItem);
    }

    @Transactional(readOnly = true)
    public List<MenuItemResponse> searchPublicMenu(String restaurantSlug, String keyword) {
        Restaurant restaurant = getPublishedRestaurant(restaurantSlug);
        String normalizedKeyword = keyword == null ? "" : keyword.trim();

        if (normalizedKeyword.isBlank()) {
            return getPublicMenu(restaurantSlug);
        }

        return map(menuItemRepository
                .findByRestaurantIdAndHiddenFalseAndAvailableTrueAndNameContainingIgnoreCaseOrderByNameAsc(
                        restaurant.getId(),
                        normalizedKeyword
                ));
    }

    @Transactional(readOnly = true)
    public List<MenuItemResponse> filterPublicMenu(
            String restaurantSlug,
            Long categoryId,
            FoodType foodType,
            Integer spicyLevel,
            Integer sweetLevel
    ) {
        List<MenuItem> items = menuItemRepository
                .findByRestaurantIdAndHiddenFalseAndAvailableTrueOrderByNameAsc(getPublishedRestaurant(restaurantSlug).getId());

        return items.stream()
                .filter(item -> categoryId == null || item.getCategory().getId().equals(categoryId))
                .filter(item -> foodType == null || item.getFoodType() == foodType)
                .filter(item -> spicyLevel == null || item.getSpicyLevel().equals(spicyLevel))
                .filter(item -> sweetLevel == null || item.getSweetLevel().equals(sweetLevel))
                .map(menuItemMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MenuItemResponse> sortPublicMenu(String restaurantSlug, String sortBy) {
        List<MenuItem> items = menuItemRepository
                .findByRestaurantIdAndHiddenFalseAndAvailableTrueOrderByNameAsc(getPublishedRestaurant(restaurantSlug).getId());

        Comparator<MenuItem> comparator = "PRICE_DESC".equalsIgnoreCase(sortBy)
                ? Comparator.comparing(MenuItem::getPrice).reversed()
                : Comparator.comparing(MenuItem::getPrice);

        return items.stream()
                .sorted(comparator)
                .map(menuItemMapper::toResponse)
                .toList();
    }

    private List<MenuItemResponse> map(List<MenuItem> items) {
        return items.stream()
                .map(menuItemMapper::toResponse)
                .toList();
    }

    private Category getOwnerCategory(Long categoryId, Long restaurantId) {
        return categoryRepository.findByIdAndRestaurantIdAndActiveTrue(categoryId, restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found."));
    }

    private MenuItem getOwnerMenuItem(Long menuItemId, Long restaurantId) {
        return menuItemRepository.findByIdAndRestaurantId(menuItemId, restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found."));
    }

    private Restaurant getPublishedRestaurant(String restaurantSlug) {
        return restaurantRepository.findBySlugAndPublishedTrueAndActiveTrue(restaurantSlug)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant website not found."));
    }

    private String trimNullable(String value) {
        return value == null ? null : value.trim();
    }
}
