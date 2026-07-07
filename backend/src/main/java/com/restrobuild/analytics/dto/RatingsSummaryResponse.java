package com.restrobuild.analytics.dto;

import java.util.Map;

public record RatingsSummaryResponse(
        double averageRating,
        long totalReviews,
        Map<Integer, Long> ratingDistribution
) {
}
