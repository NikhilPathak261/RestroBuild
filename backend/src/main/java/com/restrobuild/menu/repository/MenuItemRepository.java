package com.restrobuild.menu.repository;

import com.restrobuild.menu.entity.FoodType;
import com.restrobuild.menu.entity.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {

    List<MenuItem> findByRestaurantIdOrderByNameAsc(Long restaurantId);

    List<MenuItem> findByRestaurantIdAndHiddenFalseAndAvailableTrueOrderByNameAsc(Long restaurantId);

    List<MenuItem> findByRestaurantIdAndHiddenFalseAndAvailableTrueAndNameContainingIgnoreCaseOrderByNameAsc(
            Long restaurantId,
            String keyword
    );

    Optional<MenuItem> findByIdAndRestaurantId(Long id, Long restaurantId);

    Optional<MenuItem> findByIdAndRestaurantIdAndHiddenFalseAndAvailableTrue(Long id, Long restaurantId);

    boolean existsByCategoryId(Long categoryId);

    List<MenuItem> findByRestaurantIdAndCategoryIdAndHiddenFalseAndAvailableTrueOrderByNameAsc(
            Long restaurantId,
            Long categoryId
    );

    List<MenuItem> findByRestaurantIdAndFoodTypeAndHiddenFalseAndAvailableTrueOrderByNameAsc(
            Long restaurantId,
            FoodType foodType
    );
}
