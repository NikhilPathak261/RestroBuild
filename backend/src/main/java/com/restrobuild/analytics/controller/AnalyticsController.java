package com.restrobuild.analytics.controller;

import com.restrobuild.analytics.dto.AnalyticsSummaryResponse;
import com.restrobuild.analytics.dto.CategoryStatsResponse;
import com.restrobuild.analytics.dto.MenuItemStatsResponse;
import com.restrobuild.analytics.dto.RatingsSummaryResponse;
import com.restrobuild.analytics.dto.RevenuePointResponse;
import com.restrobuild.analytics.service.AnalyticsService;
import com.restrobuild.common.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@PreAuthorize("hasAuthority('ROLE_OWNER')")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping({"/api/analytics/summary", "/api/dashboard"})
    public ResponseEntity<ApiResponse<AnalyticsSummaryResponse>> getSummary() {
        return ResponseEntity.ok(ApiResponse.success("Analytics summary fetched successfully.", analyticsService.getSummary()));
    }

    @GetMapping("/api/analytics/revenue/daily")
    public ResponseEntity<ApiResponse<List<RevenuePointResponse>>> getDailyRevenue() {
        return ResponseEntity.ok(ApiResponse.success("Daily revenue fetched successfully.", analyticsService.getDailyRevenue()));
    }

    @GetMapping("/api/analytics/revenue/weekly")
    public ResponseEntity<ApiResponse<List<RevenuePointResponse>>> getWeeklyRevenue() {
        return ResponseEntity.ok(ApiResponse.success("Weekly revenue fetched successfully.", analyticsService.getWeeklyRevenue()));
    }

    @GetMapping("/api/analytics/revenue/monthly")
    public ResponseEntity<ApiResponse<List<RevenuePointResponse>>> getMonthlyRevenue() {
        return ResponseEntity.ok(ApiResponse.success("Monthly revenue fetched successfully.", analyticsService.getMonthlyRevenue()));
    }

    @GetMapping({"/api/analytics/menu-items/top", "/api/dashboard/popular-dishes"})
    public ResponseEntity<ApiResponse<List<MenuItemStatsResponse>>> getTopMenuItems() {
        return ResponseEntity.ok(ApiResponse.success("Top menu items fetched successfully.", analyticsService.getTopMenuItems()));
    }

    @GetMapping("/api/analytics/menu-items/bottom")
    public ResponseEntity<ApiResponse<List<MenuItemStatsResponse>>> getBottomMenuItems() {
        return ResponseEntity.ok(ApiResponse.success("Bottom menu items fetched successfully.", analyticsService.getBottomMenuItems()));
    }

    @GetMapping("/api/analytics/categories")
    public ResponseEntity<ApiResponse<List<CategoryStatsResponse>>> getCategoryStats() {
        return ResponseEntity.ok(ApiResponse.success("Category statistics fetched successfully.", analyticsService.getCategoryStats()));
    }

    @GetMapping("/api/analytics/ratings")
    public ResponseEntity<ApiResponse<RatingsSummaryResponse>> getRatingsSummary() {
        return ResponseEntity.ok(ApiResponse.success("Ratings summary fetched successfully.", analyticsService.getRatingsSummary()));
    }
}
