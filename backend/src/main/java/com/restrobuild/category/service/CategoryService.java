package com.restrobuild.category.service;

import com.restrobuild.category.dto.CategoryRequest;
import com.restrobuild.category.dto.CategoryResponse;
import com.restrobuild.category.entity.Category;
import com.restrobuild.category.mapper.CategoryMapper;
import com.restrobuild.category.repository.CategoryRepository;
import com.restrobuild.exception.BusinessException;
import com.restrobuild.exception.ResourceNotFoundException;
import com.restrobuild.menu.repository.MenuItemRepository;
import com.restrobuild.restaurant.entity.Restaurant;
import com.restrobuild.restaurant.repository.RestaurantRepository;
import com.restrobuild.security.AuthenticatedUserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final MenuItemRepository menuItemRepository;
    private final RestaurantRepository restaurantRepository;
    private final AuthenticatedUserService authenticatedUserService;
    private final CategoryMapper categoryMapper;

    public CategoryService(
            CategoryRepository categoryRepository,
            MenuItemRepository menuItemRepository,
            RestaurantRepository restaurantRepository,
            AuthenticatedUserService authenticatedUserService,
            CategoryMapper categoryMapper
    ) {
        this.categoryRepository = categoryRepository;
        this.menuItemRepository = menuItemRepository;
        this.restaurantRepository = restaurantRepository;
        this.authenticatedUserService = authenticatedUserService;
        this.categoryMapper = categoryMapper;
    }

    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        Restaurant restaurant = authenticatedUserService.getAuthenticatedOwnerRestaurant();
        String name = request.name().trim();

        if (categoryRepository.existsByRestaurantIdAndNameIgnoreCaseAndActiveTrue(restaurant.getId(), name)) {
            throw new BusinessException("Category name already exists.");
        }

        Category category = new Category(restaurant, name, request.displayOrder());
        return categoryMapper.toResponse(categoryRepository.save(category));
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getMyCategories() {
        Restaurant restaurant = authenticatedUserService.getAuthenticatedOwnerRestaurant();
        return findActiveCategories(restaurant.getId());
    }

    @Transactional
    public CategoryResponse updateCategory(Long categoryId, CategoryRequest request) {
        Restaurant restaurant = authenticatedUserService.getAuthenticatedOwnerRestaurant();
        Category category = getActiveCategory(categoryId, restaurant.getId());
        String name = request.name().trim();

        if (categoryRepository.existsByRestaurantIdAndNameIgnoreCaseAndIdNotAndActiveTrue(
                restaurant.getId(),
                name,
                categoryId
        )) {
            throw new BusinessException("Category name already exists.");
        }

        category.update(name, request.displayOrder());
        return categoryMapper.toResponse(category);
    }

    @Transactional
    public void deleteCategory(Long categoryId) {
        Restaurant restaurant = authenticatedUserService.getAuthenticatedOwnerRestaurant();
        Category category = getActiveCategory(categoryId, restaurant.getId());
        if (menuItemRepository.existsByCategoryId(category.getId())) {
            throw new BusinessException("Category cannot be deleted while menu items exist inside it.");
        }

        categoryRepository.delete(category);
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getPublicCategories(String restaurantSlug) {
        Restaurant restaurant = restaurantRepository.findBySlugAndPublishedTrueAndActiveTrue(restaurantSlug)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant website not found."));

        return findActiveCategories(restaurant.getId());
    }

    private List<CategoryResponse> findActiveCategories(Long restaurantId) {
        return categoryRepository.findByRestaurantIdAndActiveTrueOrderByDisplayOrderAscNameAsc(restaurantId)
                .stream()
                .map(categoryMapper::toResponse)
                .toList();
    }

    private Category getActiveCategory(Long categoryId, Long restaurantId) {
        return categoryRepository.findByIdAndRestaurantIdAndActiveTrue(categoryId, restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found."));
    }
}
