package com.restrobuild.category.mapper;

import com.restrobuild.category.dto.CategoryResponse;
import com.restrobuild.category.entity.Category;
import org.springframework.stereotype.Component;

@Component
public class CategoryMapper {

    public CategoryResponse toResponse(Category category) {
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getDisplayOrder(),
                category.isActive()
        );
    }
}
