package com.restrobuild.category.service;

import com.restrobuild.category.entity.Category;
import com.restrobuild.category.mapper.CategoryMapper;
import com.restrobuild.category.repository.CategoryRepository;
import com.restrobuild.exception.BusinessException;
import com.restrobuild.menu.repository.MenuItemRepository;
import com.restrobuild.restaurant.entity.Restaurant;
import com.restrobuild.restaurant.repository.RestaurantRepository;
import com.restrobuild.security.AuthenticatedUserService;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class CategoryServiceTest {

    private final CategoryRepository categoryRepository = mock(CategoryRepository.class);
    private final MenuItemRepository menuItemRepository = mock(MenuItemRepository.class);
    private final RestaurantRepository restaurantRepository = mock(RestaurantRepository.class);
    private final AuthenticatedUserService authenticatedUserService = mock(AuthenticatedUserService.class);
    private final CategoryService service = new CategoryService(
            categoryRepository,
            menuItemRepository,
            restaurantRepository,
            authenticatedUserService,
            new CategoryMapper()
    );

    @Test
    void deleteCategoryRejectsCategoriesWithMenuItems() {
        Restaurant restaurant = restaurant();
        Category category = category(restaurant);
        when(authenticatedUserService.getAuthenticatedOwnerRestaurant()).thenReturn(restaurant);
        when(categoryRepository.findByIdAndRestaurantIdAndActiveTrue(2L, 1L)).thenReturn(Optional.of(category));
        when(menuItemRepository.existsByCategoryId(2L)).thenReturn(true);

        assertThrows(BusinessException.class, () -> service.deleteCategory(2L));

        verify(categoryRepository, never()).delete(category);
    }

    @Test
    void deleteCategoryDeletesEmptyCategories() {
        Restaurant restaurant = restaurant();
        Category category = category(restaurant);
        when(authenticatedUserService.getAuthenticatedOwnerRestaurant()).thenReturn(restaurant);
        when(categoryRepository.findByIdAndRestaurantIdAndActiveTrue(2L, 1L)).thenReturn(Optional.of(category));
        when(menuItemRepository.existsByCategoryId(2L)).thenReturn(false);

        service.deleteCategory(2L);

        verify(categoryRepository).delete(category);
    }

    private Restaurant restaurant() {
        Restaurant restaurant = new Restaurant(
                "Spice House",
                "Demo restaurant",
                "Demo Street",
                "1234567890",
                "hello@spice.test",
                "11 AM - 11 PM",
                null,
                null,
                "spice-house"
        );
        ReflectionTestUtils.setField(restaurant, "id", 1L);
        return restaurant;
    }

    private Category category(Restaurant restaurant) {
        Category category = new Category(restaurant, "Mains", 1);
        ReflectionTestUtils.setField(category, "id", 2L);
        return category;
    }
}
