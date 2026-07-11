package com.restrobuild.order.mapper;

import com.restrobuild.category.entity.Category;
import com.restrobuild.menu.entity.FoodType;
import com.restrobuild.menu.entity.MenuItem;
import com.restrobuild.order.entity.CustomerOrder;
import com.restrobuild.order.entity.OrderItem;
import com.restrobuild.restaurant.entity.Restaurant;
import com.restrobuild.review.repository.ReviewRepository;
import com.restrobuild.table.entity.RestaurantTable;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class OrderMapperTest {

    private final ReviewRepository reviewRepository = mock(ReviewRepository.class);
    private final OrderMapper mapper = new OrderMapper(reviewRepository);

    @Test
    void mapsOrderItemReviewedState() {
        CustomerOrder order = orderWithItem(20L);
        when(reviewRepository.existsByOrderItemId(20L)).thenReturn(true);

        var response = mapper.toResponse(order);

        assertTrue(response.items().get(0).reviewed());
    }

    @Test
    void mapsUnsavedOrderItemsAsNotReviewed() {
        CustomerOrder order = orderWithItem(null);

        var response = mapper.toResponse(order);

        assertFalse(response.items().get(0).reviewed());
    }

    private CustomerOrder orderWithItem(Long orderItemId) {
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

        CustomerOrder order = new CustomerOrder(restaurant, table, null);
        OrderItem orderItem = new OrderItem(menuItem, 2);
        order.addItem(orderItem);
        ReflectionTestUtils.setField(orderItem, "id", orderItemId);
        return order;
    }
}
