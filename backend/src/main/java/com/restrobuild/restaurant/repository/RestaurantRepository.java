package com.restrobuild.restaurant.repository;

import com.restrobuild.restaurant.entity.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCaseAndIdNot(String email, Long id);

    boolean existsBySlug(String slug);

    Optional<Restaurant> findBySlugAndPublishedTrueAndActiveTrue(String slug);
}
