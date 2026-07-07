package com.restrobuild.review.dto;

import java.time.Instant;

public record ReviewResponse(
        Long id,
        Long menuItemId,
        String menuItemName,
        Long orderItemId,
        Integer rating,
        String comment,
        boolean visible,
        Instant createdAt
) {
}
