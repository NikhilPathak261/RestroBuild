package com.restrobuild.review.repository;

import com.restrobuild.review.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    boolean existsByOrderItemId(Long orderItemId);

    Optional<Review> findByIdAndRestaurantId(Long id, Long restaurantId);

    List<Review> findByRestaurantIdOrderByCreatedAtDesc(Long restaurantId);

    List<Review> findByRestaurantIdAndRatingOrderByCreatedAtDesc(Long restaurantId, Integer rating);

    List<Review> findByRestaurantIdAndMenuItemIdOrderByCreatedAtDesc(Long restaurantId, Long menuItemId);

    List<Review> findByMenuItemIdAndVisibleTrueOrderByCreatedAtDesc(Long menuItemId);
}
