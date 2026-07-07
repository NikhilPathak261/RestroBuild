package com.restrobuild.review.controller;

import com.restrobuild.common.ApiResponse;
import com.restrobuild.review.dto.ReviewResponse;
import com.restrobuild.review.dto.SubmitReviewRequest;
import com.restrobuild.review.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping("/api/reviews")
    public ResponseEntity<ApiResponse<ReviewResponse>> submitReview(@Valid @RequestBody SubmitReviewRequest request) {
        ReviewResponse response = reviewService.submitReview(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Review submitted successfully.", response));
    }

    @GetMapping("/api/reviews")
    @PreAuthorize("hasAuthority('ROLE_OWNER')")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getRestaurantReviews(
            @RequestParam(required = false) Integer rating,
            @RequestParam(required = false) Long menuItemId
    ) {
        List<ReviewResponse> response = reviewService.getRestaurantReviews(rating, menuItemId);
        return ResponseEntity.ok(ApiResponse.success("Reviews fetched successfully.", response));
    }

    @GetMapping("/api/public/menu-items/{menuItemId}/reviews")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getPublicMenuItemReviews(@PathVariable Long menuItemId) {
        List<ReviewResponse> response = reviewService.getPublicMenuItemReviews(menuItemId);
        return ResponseEntity.ok(ApiResponse.success("Reviews fetched successfully.", response));
    }

    @PatchMapping("/api/reviews/{reviewId}/hide")
    @PreAuthorize("hasAuthority('ROLE_OWNER')")
    public ResponseEntity<ApiResponse<ReviewResponse>> hideReview(@PathVariable Long reviewId) {
        ReviewResponse response = reviewService.hideReview(reviewId);
        return ResponseEntity.ok(ApiResponse.success("Review hidden successfully.", response));
    }

    @PatchMapping("/api/reviews/{reviewId}/show")
    @PreAuthorize("hasAuthority('ROLE_OWNER')")
    public ResponseEntity<ApiResponse<ReviewResponse>> showReview(@PathVariable Long reviewId) {
        ReviewResponse response = reviewService.showReview(reviewId);
        return ResponseEntity.ok(ApiResponse.success("Review shown successfully.", response));
    }

    @DeleteMapping("/api/reviews/{reviewId}")
    @PreAuthorize("hasAuthority('ROLE_OWNER')")
    public ResponseEntity<ApiResponse<Void>> deleteReview(@PathVariable Long reviewId) {
        reviewService.deleteReview(reviewId);
        return ResponseEntity.ok(ApiResponse.success("Review deleted successfully."));
    }
}
