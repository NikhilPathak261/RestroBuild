package com.restrobuild.category.dto;

public record CategoryResponse(
        Long id,
        String name,
        Integer displayOrder,
        boolean active
) {
}
