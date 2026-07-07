package com.restrobuild.review.mapper;

import com.restrobuild.review.dto.ReviewResponse;
import com.restrobuild.review.entity.Review;
import org.springframework.stereotype.Component;

@Component
public class ReviewMapper {

    public ReviewResponse toResponse(Review review) {
        return new ReviewResponse(
                review.getId(),
                review.getMenuItem().getId(),
                review.getMenuItem().getName(),
                review.getOrderItem().getId(),
                review.getRating(),
                review.getComment(),
                review.isVisible(),
                review.getCreatedAt()
        );
    }
}
