package com.restrobuild.category.controller;

import com.restrobuild.category.dto.CategoryRequest;
import com.restrobuild.category.dto.CategoryResponse;
import com.restrobuild.category.service.CategoryService;
import com.restrobuild.common.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @PostMapping("/api/categories")
    @PreAuthorize("hasAuthority('ROLE_OWNER')")
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(
            @Valid @RequestBody CategoryRequest request
    ) {
        CategoryResponse response = categoryService.createCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Category created successfully.", response));
    }

    @GetMapping("/api/categories")
    @PreAuthorize("hasAuthority('ROLE_OWNER')")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getCategories() {
        List<CategoryResponse> response = categoryService.getMyCategories();
        return ResponseEntity.ok(ApiResponse.success("Categories fetched successfully.", response));
    }

    @PutMapping("/api/categories/{categoryId}")
    @PreAuthorize("hasAuthority('ROLE_OWNER')")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(
            @PathVariable Long categoryId,
            @Valid @RequestBody CategoryRequest request
    ) {
        CategoryResponse response = categoryService.updateCategory(categoryId, request);
        return ResponseEntity.ok(ApiResponse.success("Category updated successfully.", response));
    }

    @DeleteMapping("/api/categories/{categoryId}")
    @PreAuthorize("hasAuthority('ROLE_OWNER')")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long categoryId) {
        categoryService.deleteCategory(categoryId);
        return ResponseEntity.ok(ApiResponse.success("Category deleted successfully."));
    }

    @GetMapping("/api/public/{restaurantSlug}/categories")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getPublicCategories(
            @PathVariable String restaurantSlug
    ) {
        List<CategoryResponse> response = categoryService.getPublicCategories(restaurantSlug);
        return ResponseEntity.ok(ApiResponse.success("Categories fetched successfully.", response));
    }
}
