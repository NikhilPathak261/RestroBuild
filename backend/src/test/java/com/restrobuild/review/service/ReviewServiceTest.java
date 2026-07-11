package com.restrobuild.review.service;

import com.restrobuild.category.entity.Category;
import com.restrobuild.exception.BusinessException;
import com.restrobuild.menu.entity.FoodType;
import com.restrobuild.menu.entity.MenuItem;
import com.restrobuild.order.entity.CustomerOrder;
import com.restrobuild.order.entity.OrderItem;
import com.restrobuild.order.entity.OrderStatus;
import com.restrobuild.order.repository.OrderItemRepository;
import com.restrobuild.restaurant.entity.Restaurant;
import com.restrobuild.review.dto.SubmitReviewRequest;
import com.restrobuild.review.entity.Review;
import com.restrobuild.review.mapper.ReviewMapper;
import com.restrobuild.review.repository.ReviewRepository;
import com.restrobuild.security.AuthenticatedUserService;
import com.restrobuild.table.entity.RestaurantTable;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ReviewServiceTest {

    private final ReviewRepository reviewRepository = mock(ReviewRepository.class);
    private final OrderItemRepository orderItemRepository = mock(OrderItemRepository.class);
    private final AuthenticatedUserService authenticatedUserService = mock(AuthenticatedUserService.class);
    private final ReviewService service = new ReviewService(
            reviewRepository,
            orderItemRepository,
            authenticatedUserService,
            new ReviewMapper()
    );

    @Test
    void submitReviewAllowsServedOrderedItemAndTrimsComment() {
        OrderItem orderItem = orderItem(OrderStatus.SERVED);
        when(orderItemRepository.findById(20L)).thenReturn(Optional.of(orderItem));
        when(reviewRepository.existsByOrderItemId(20L)).thenReturn(false);
        when(reviewRepository.save(any(Review.class))).thenAnswer(invocation -> {
            Review review = invocation.getArgument(0);
            ReflectionTestUtils.setField(review, "id", 30L);
            ReflectionTestUtils.setField(review, "createdAt", java.time.Instant.parse("2026-07-10T10:00:00Z"));
            return review;
        });

        var response = service.submitReview(new SubmitReviewRequest(20L, 5, "  Great dish  "));

        assertEquals(30L, response.id());
        assertEquals(20L, response.orderItemId());
        assertEquals(5, response.rating());
        assertEquals("Great dish", response.comment());
        verify(reviewRepository).save(any(Review.class));
    }

    @Test
    void submitReviewRejectsUnservedOrderItems() {
        OrderItem orderItem = orderItem(OrderStatus.READY);
        when(orderItemRepository.findById(20L)).thenReturn(Optional.of(orderItem));

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> service.submitReview(new SubmitReviewRequest(20L, 4, "Looks good"))
        );

        assertEquals("Reviews are allowed only after the order is served.", exception.getMessage());
        verify(reviewRepository, never()).save(any());
    }

    @Test
    void submitReviewRejectsDuplicateOrderItemReview() {
        OrderItem orderItem = orderItem(OrderStatus.SERVED);
        when(orderItemRepository.findById(20L)).thenReturn(Optional.of(orderItem));
        when(reviewRepository.existsByOrderItemId(20L)).thenReturn(true);

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> service.submitReview(new SubmitReviewRequest(20L, 4, "Again"))
        );

        assertEquals("Review already submitted for this order item.", exception.getMessage());
        verify(reviewRepository, never()).save(any());
    }

    private OrderItem orderItem(OrderStatus status) {
        Restaurant restaurant = new Restaurant(
                "Spice House",
                "Demo restaurant",
                "Demo Street",
                "1234567890",
                "hello@spice.test",
                "11 AM - 11 PM",
                null,
                null,
                "spice-house"
        );
        ReflectionTestUtils.setField(restaurant, "id", 1L);

        RestaurantTable table = new RestaurantTable(restaurant, 4);
        ReflectionTestUtils.setField(table, "id", 4L);

        CustomerOrder order = new CustomerOrder(restaurant, table, null);
        if (status == OrderStatus.PREPARING) {
            order.markPreparing();
        } else if (status == OrderStatus.READY) {
            order.markPreparing();
            order.markReady();
        } else if (status == OrderStatus.SERVED) {
            order.markPreparing();
            order.markReady();
            order.markServed();
        } else if (status == OrderStatus.CANCELLED) {
            order.cancel();
        }
        ReflectionTestUtils.setField(order, "id", 10L);

        Category category = new Category(restaurant, "Mains", 1);
        ReflectionTestUtils.setField(category, "id", 2L);
        MenuItem menuItem = new MenuItem(
                restaurant,
                category,
                "Paneer Tikka",
                "Charred paneer skewers",
                BigDecimal.valueOf(250),
                null,
                FoodType.VEG,
                1,
                1,
                18,
                true
        );
        ReflectionTestUtils.setField(menuItem, "id", 3L);

        OrderItem orderItem = new OrderItem(menuItem, 2);
        order.addItem(orderItem);
        ReflectionTestUtils.setField(orderItem, "id", 20L);
        return orderItem;
    }
}
