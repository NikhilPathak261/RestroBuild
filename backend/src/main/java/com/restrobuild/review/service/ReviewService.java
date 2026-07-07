package com.restrobuild.review.service;

import com.restrobuild.exception.BusinessException;
import com.restrobuild.exception.ResourceNotFoundException;
import com.restrobuild.order.entity.OrderItem;
import com.restrobuild.order.entity.OrderStatus;
import com.restrobuild.order.repository.OrderItemRepository;
import com.restrobuild.restaurant.entity.Restaurant;
import com.restrobuild.review.dto.ReviewResponse;
import com.restrobuild.review.dto.SubmitReviewRequest;
import com.restrobuild.review.entity.Review;
import com.restrobuild.review.mapper.ReviewMapper;
import com.restrobuild.review.repository.ReviewRepository;
import com.restrobuild.security.AuthenticatedUserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final OrderItemRepository orderItemRepository;
    private final AuthenticatedUserService authenticatedUserService;
    private final ReviewMapper reviewMapper;

    public ReviewService(
            ReviewRepository reviewRepository,
            OrderItemRepository orderItemRepository,
            AuthenticatedUserService authenticatedUserService,
            ReviewMapper reviewMapper
    ) {
        this.reviewRepository = reviewRepository;
        this.orderItemRepository = orderItemRepository;
        this.authenticatedUserService = authenticatedUserService;
        this.reviewMapper = reviewMapper;
    }

    @Transactional
    public ReviewResponse submitReview(SubmitReviewRequest request) {
        OrderItem orderItem = orderItemRepository.findById(request.orderItemId())
                .orElseThrow(() -> new ResourceNotFoundException("Order item not found."));

        if (orderItem.getOrder().getStatus() != OrderStatus.SERVED) {
            throw new BusinessException("Reviews are allowed only after the order is served.");
        }

        if (reviewRepository.existsByOrderItemId(orderItem.getId())) {
            throw new BusinessException("Review already submitted for this order item.");
        }

        Review review = new Review(
                orderItem.getOrder().getTable().getRestaurant(),
                orderItem.getMenuItem(),
                orderItem,
                request.rating(),
                trimNullable(request.comment())
        );

        return reviewMapper.toResponse(reviewRepository.save(review));
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getRestaurantReviews(Integer rating, Long menuItemId) {
        Restaurant restaurant = authenticatedUserService.getAuthenticatedOwnerRestaurant();
        List<Review> reviews;

        if (rating != null) {
            reviews = reviewRepository.findByRestaurantIdAndRatingOrderByCreatedAtDesc(restaurant.getId(), rating);
        } else if (menuItemId != null) {
            reviews = reviewRepository.findByRestaurantIdAndMenuItemIdOrderByCreatedAtDesc(restaurant.getId(), menuItemId);
        } else {
            reviews = reviewRepository.findByRestaurantIdOrderByCreatedAtDesc(restaurant.getId());
        }

        return reviews.stream().map(reviewMapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getPublicMenuItemReviews(Long menuItemId) {
        return reviewRepository.findByMenuItemIdAndVisibleTrueOrderByCreatedAtDesc(menuItemId)
                .stream()
                .map(reviewMapper::toResponse)
                .toList();
    }

    @Transactional
    public ReviewResponse hideReview(Long reviewId) {
        Review review = getOwnerReview(reviewId);
        review.hide();
        return reviewMapper.toResponse(review);
    }

    @Transactional
    public ReviewResponse showReview(Long reviewId) {
        Review review = getOwnerReview(reviewId);
        review.show();
        return reviewMapper.toResponse(review);
    }

    @Transactional
    public void deleteReview(Long reviewId) {
        Review review = getOwnerReview(reviewId);
        reviewRepository.delete(review);
    }

    private Review getOwnerReview(Long reviewId) {
        Restaurant restaurant = authenticatedUserService.getAuthenticatedOwnerRestaurant();
        return reviewRepository.findByIdAndRestaurantId(reviewId, restaurant.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Review not found."));
    }

    private String trimNullable(String value) {
        return value == null ? null : value.trim();
    }
}
