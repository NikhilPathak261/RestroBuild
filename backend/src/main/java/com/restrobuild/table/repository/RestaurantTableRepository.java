package com.restrobuild.table.repository;

import com.restrobuild.table.entity.RestaurantTable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RestaurantTableRepository extends JpaRepository<RestaurantTable, Long> {

    List<RestaurantTable> findByRestaurantIdAndActiveTrueOrderByTableNumberAsc(Long restaurantId);

    Optional<RestaurantTable> findByIdAndRestaurantIdAndActiveTrue(Long id, Long restaurantId);

    Optional<RestaurantTable> findByIdAndActiveTrue(Long id);

    boolean existsByRestaurantIdAndTableNumberAndActiveTrue(Long restaurantId, Integer tableNumber);

    boolean existsByRestaurantIdAndTableNumberAndIdNotAndActiveTrue(Long restaurantId, Integer tableNumber, Long id);
}
