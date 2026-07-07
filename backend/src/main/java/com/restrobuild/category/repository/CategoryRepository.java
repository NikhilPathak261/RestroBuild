package com.restrobuild.category.repository;

import com.restrobuild.category.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    List<Category> findByRestaurantIdAndActiveTrueOrderByDisplayOrderAscNameAsc(Long restaurantId);

    boolean existsByRestaurantIdAndNameIgnoreCaseAndActiveTrue(Long restaurantId, String name);

    boolean existsByRestaurantIdAndNameIgnoreCaseAndIdNotAndActiveTrue(Long restaurantId, String name, Long id);

    Optional<Category> findByIdAndRestaurantIdAndActiveTrue(Long id, Long restaurantId);
}
