package com.restrobuild.review.repository;

import com.restrobuild.review.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    boolean existsByOrderItemId(Long orderItemId);

    Optional<Review> findByIdAndRestaurantId(Long id, Long restaurantId);

    List<Review> findByRestaurantIdOrderByCreatedAtDesc(Long restaurantId);

    List<Review> findByRestaurantIdAndRatingOrderByCreatedAtDesc(Long restaurantId, Integer rating);

    List<Review> findByRestaurantIdAndMenuItemIdOrderByCreatedAtDesc(Long restaurantId, Long menuItemId);

    List<Review> findByMenuItemIdAndVisibleTrueOrderByCreatedAtDesc(Long menuItemId);

    long countByRestaurantId(Long restaurantId);

    long countByRestaurantIdAndRating(Long restaurantId, Integer rating);

    @Query("select coalesce(avg(r.rating), 0) from Review r where r.restaurant.id = :restaurantId")
    Double averageRating(@Param("restaurantId") Long restaurantId);
}
