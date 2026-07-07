package com.restrobuild.analytics.service;

import com.restrobuild.analytics.dto.AnalyticsSummaryResponse;
import com.restrobuild.analytics.dto.CategoryStatsResponse;
import com.restrobuild.analytics.dto.MenuItemStatsResponse;
import com.restrobuild.analytics.dto.RatingsSummaryResponse;
import com.restrobuild.analytics.dto.RevenuePointResponse;
import com.restrobuild.order.repository.CustomerOrderRepository;
import com.restrobuild.order.repository.OrderItemRepository;
import com.restrobuild.restaurant.entity.Restaurant;
import com.restrobuild.review.repository.ReviewRepository;
import com.restrobuild.security.AuthenticatedUserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class AnalyticsService {

    private final CustomerOrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ReviewRepository reviewRepository;
    private final AuthenticatedUserService authenticatedUserService;
    private final ZoneId zoneId = ZoneId.systemDefault();

    public AnalyticsService(
            CustomerOrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            ReviewRepository reviewRepository,
            AuthenticatedUserService authenticatedUserService
    ) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.reviewRepository = reviewRepository;
        this.authenticatedUserService = authenticatedUserService;
    }

    @Transactional(readOnly = true)
    public AnalyticsSummaryResponse getSummary() {
        Restaurant restaurant = authenticatedUserService.getAuthenticatedOwnerRestaurant();
        Instant startOfToday = LocalDate.now(zoneId).atStartOfDay(zoneId).toInstant();
        Instant startOfTomorrow = LocalDate.now(zoneId).plusDays(1).atStartOfDay(zoneId).toInstant();

        return new AnalyticsSummaryResponse(
                orderRepository.countByRestaurantId(restaurant.getId()),
                orderRepository.countByRestaurantIdAndOrderedAtBetween(restaurant.getId(), startOfToday, startOfTomorrow),
                orderRepository.sumRevenue(restaurant.getId()),
                orderRepository.sumRevenueBetween(restaurant.getId(), startOfToday, startOfTomorrow),
                round(reviewRepository.averageRating(restaurant.getId()))
        );
    }

    @Transactional(readOnly = true)
    public List<RevenuePointResponse> getDailyRevenue() {
        return revenueSeries(7, "yyyy-MM-dd");
    }

    @Transactional(readOnly = true)
    public List<RevenuePointResponse> getWeeklyRevenue() {
        return revenueSeries(4, "yyyy-MM-dd", 7);
    }

    @Transactional(readOnly = true)
    public List<RevenuePointResponse> getMonthlyRevenue() {
        Restaurant restaurant = authenticatedUserService.getAuthenticatedOwnerRestaurant();
        LocalDate currentMonth = LocalDate.now(zoneId).withDayOfMonth(1).minusMonths(5);
        List<RevenuePointResponse> points = new ArrayList<>();

        for (int index = 0; index < 6; index++) {
            LocalDate startDate = currentMonth.plusMonths(index);
            LocalDate endDate = startDate.plusMonths(1);
            points.add(new RevenuePointResponse(
                    startDate.toString().substring(0, 7),
                    orderRepository.sumRevenueBetween(
                            restaurant.getId(),
                            startDate.atStartOfDay(zoneId).toInstant(),
                            endDate.atStartOfDay(zoneId).toInstant()
                    )
            ));
        }

        return points;
    }

    @Transactional(readOnly = true)
    public List<MenuItemStatsResponse> getTopMenuItems() {
        Restaurant restaurant = authenticatedUserService.getAuthenticatedOwnerRestaurant();
        return orderItemRepository.findTopMenuItems(restaurant.getId())
                .stream()
                .limit(10)
                .map(this::toMenuItemStats)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MenuItemStatsResponse> getBottomMenuItems() {
        Restaurant restaurant = authenticatedUserService.getAuthenticatedOwnerRestaurant();
        return orderItemRepository.findBottomMenuItems(restaurant.getId())
                .stream()
                .limit(10)
                .map(this::toMenuItemStats)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CategoryStatsResponse> getCategoryStats() {
        Restaurant restaurant = authenticatedUserService.getAuthenticatedOwnerRestaurant();
        return orderItemRepository.findCategoryStats(restaurant.getId())
                .stream()
                .map(row -> new CategoryStatsResponse((Long) row[0], (String) row[1], ((Number) row[2]).longValue()))
                .toList();
    }

    @Transactional(readOnly = true)
    public RatingsSummaryResponse getRatingsSummary() {
        Restaurant restaurant = authenticatedUserService.getAuthenticatedOwnerRestaurant();
        Map<Integer, Long> distribution = new LinkedHashMap<>();
        for (int rating = 5; rating >= 1; rating--) {
            distribution.put(rating, reviewRepository.countByRestaurantIdAndRating(restaurant.getId(), rating));
        }

        return new RatingsSummaryResponse(
                round(reviewRepository.averageRating(restaurant.getId())),
                reviewRepository.countByRestaurantId(restaurant.getId()),
                distribution
        );
    }

    private List<RevenuePointResponse> revenueSeries(int periods, String labelPattern) {
        return revenueSeries(periods, labelPattern, 1);
    }

    private List<RevenuePointResponse> revenueSeries(int periods, String labelPattern, int daysPerPeriod) {
        Restaurant restaurant = authenticatedUserService.getAuthenticatedOwnerRestaurant();
        LocalDate startDate = LocalDate.now(zoneId).minusDays((long) (periods - 1) * daysPerPeriod);
        List<RevenuePointResponse> points = new ArrayList<>();

        for (int index = 0; index < periods; index++) {
            LocalDate periodStart = startDate.plusDays((long) index * daysPerPeriod);
            LocalDate periodEnd = periodStart.plusDays(daysPerPeriod);
            points.add(new RevenuePointResponse(
                    java.time.format.DateTimeFormatter.ofPattern(labelPattern).format(periodStart),
                    orderRepository.sumRevenueBetween(
                            restaurant.getId(),
                            periodStart.atStartOfDay(zoneId).toInstant(),
                            periodEnd.atStartOfDay(zoneId).toInstant()
                    )
            ));
        }

        return points;
    }

    private MenuItemStatsResponse toMenuItemStats(Object[] row) {
        return new MenuItemStatsResponse((Long) row[0], (String) row[1], ((Number) row[2]).longValue());
    }

    private double round(Double value) {
        return Math.round((value == null ? 0.0 : value) * 10.0) / 10.0;
    }
}
