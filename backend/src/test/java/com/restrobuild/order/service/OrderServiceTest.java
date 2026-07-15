package com.restrobuild.order.service;

import com.restrobuild.category.entity.Category;
import com.restrobuild.menu.entity.FoodType;
import com.restrobuild.menu.entity.MenuItem;
import com.restrobuild.menu.repository.MenuItemRepository;
import com.restrobuild.order.entity.CustomerOrder;
import com.restrobuild.order.entity.OrderItem;
import com.restrobuild.order.entity.OrderStatus;
import com.restrobuild.order.mapper.OrderMapper;
import com.restrobuild.order.repository.CustomerOrderRepository;
import com.restrobuild.restaurant.entity.Restaurant;
import com.restrobuild.security.AuthenticatedUserService;
import com.restrobuild.table.entity.RestaurantTable;
import com.restrobuild.table.repository.RestaurantTableRepository;
import com.restrobuild.websocket.service.OrderEventPublisher;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class OrderServiceTest {

    private final CustomerOrderRepository orderRepository = mock(CustomerOrderRepository.class);
    private final RestaurantTableRepository tableRepository = mock(RestaurantTableRepository.class);
    private final MenuItemRepository menuItemRepository = mock(MenuItemRepository.class);
    private final AuthenticatedUserService authenticatedUserService = mock(AuthenticatedUserService.class);
    private final OrderMapper orderMapper = mock(OrderMapper.class);
    private final OrderEventPublisher orderEventPublisher = mock(OrderEventPublisher.class);
    private final OrderService service = new OrderService(
            orderRepository,
            tableRepository,
            menuItemRepository,
            authenticatedUserService,
            orderMapper,
            orderEventPublisher
    );

    @Test
    void getTableBillAggregatesNonCancelledTableOrders() {
        Restaurant restaurant = publishedRestaurant();
        RestaurantTable table = table(restaurant);
        MenuItem paneer = menuItem(restaurant, 7L, "Paneer Tikka", BigDecimal.valueOf(250), 18);
        MenuItem lassi = menuItem(restaurant, 8L, "Mango Lassi", BigDecimal.valueOf(200), 5);
        CustomerOrder readyOrder = order(55L, restaurant, table, OrderStatus.READY, List.of(
                new OrderItem(paneer, 2),
                new OrderItem(lassi, 1)
        ));
        CustomerOrder servedOrder = order(56L, restaurant, table, OrderStatus.SERVED, List.of(
                new OrderItem(paneer, 1)
        ));
        when(tableRepository.findByIdAndActiveTrue(4L)).thenReturn(Optional.of(table));
        when(orderRepository.findByTableIdAndStatusInOrderByOrderedAtAsc(
                4L,
                List.of(OrderStatus.PENDING, OrderStatus.PREPARING, OrderStatus.READY, OrderStatus.SERVED)
        )).thenReturn(List.of(readyOrder, servedOrder));

        var bill = service.getTableBill(4L);

        assertEquals(4L, bill.tableId());
        assertEquals(4, bill.tableNumber());
        assertEquals(2, bill.orderCount());
        assertEquals(4, bill.itemCount());
        assertEquals(0, BigDecimal.valueOf(950).compareTo(bill.totalAmount()));
        assertEquals(3, bill.items().size());
        assertEquals(55L, bill.items().get(0).orderId());
        assertEquals(OrderStatus.READY, bill.items().get(0).orderStatus());
        assertEquals("Paneer Tikka", bill.items().get(0).menuItemName());
        assertEquals(0, BigDecimal.valueOf(500).compareTo(bill.items().get(0).subtotal()));
    }

    @Test
    void getOrderTimelineUsesKnownTimestampsAndNullsUnknownTransitionTimes() {
        Restaurant restaurant = publishedRestaurant();
        RestaurantTable table = table(restaurant);
        CustomerOrder order = order(77L, restaurant, table, OrderStatus.READY, List.of(
                new OrderItem(menuItem(restaurant, 9L, "Dal", BigDecimal.valueOf(180), 20), 1)
        ));
        Instant orderedAt = Instant.parse("2026-07-10T10:00:00Z");
        Instant updatedAt = Instant.parse("2026-07-10T10:20:00Z");
        ReflectionTestUtils.setField(order, "orderedAt", orderedAt);
        ReflectionTestUtils.setField(order, "updatedAt", updatedAt);
        when(orderRepository.findById(77L)).thenReturn(Optional.of(order));

        var timeline = service.getOrderTimeline(77L);

        assertEquals(4, timeline.size());
        assertEquals(OrderStatus.PENDING, timeline.get(0).status());
        assertEquals("completed", timeline.get(0).state());
        assertEquals(orderedAt, timeline.get(0).timestamp());
        assertEquals(OrderStatus.PREPARING, timeline.get(1).status());
        assertEquals("completed", timeline.get(1).state());
        assertNull(timeline.get(1).timestamp());
        assertEquals(OrderStatus.READY, timeline.get(2).status());
        assertEquals("current", timeline.get(2).state());
        assertEquals(updatedAt, timeline.get(2).timestamp());
        assertEquals("upcoming", timeline.get(3).state());
    }

    @Test
    void getOrderTimelineReturnsCancelledTerminalStep() {
        Restaurant restaurant = publishedRestaurant();
        RestaurantTable table = table(restaurant);
        CustomerOrder order = order(88L, restaurant, table, OrderStatus.CANCELLED, List.of(
                new OrderItem(menuItem(restaurant, 10L, "Soup", BigDecimal.valueOf(120), 10), 1)
        ));
        Instant orderedAt = Instant.parse("2026-07-10T11:00:00Z");
        Instant updatedAt = Instant.parse("2026-07-10T11:05:00Z");
        ReflectionTestUtils.setField(order, "orderedAt", orderedAt);
        ReflectionTestUtils.setField(order, "updatedAt", updatedAt);
        when(orderRepository.findById(88L)).thenReturn(Optional.of(order));

        var timeline = service.getOrderTimeline(88L);

        assertEquals(2, timeline.size());
        assertEquals(OrderStatus.PENDING, timeline.get(0).status());
        assertEquals("The kitchen has received your order.", timeline.get(0).description());
        assertEquals(orderedAt, timeline.get(0).timestamp());
        assertEquals(OrderStatus.CANCELLED, timeline.get(1).status());
        assertEquals("current", timeline.get(1).state());
        assertEquals(updatedAt, timeline.get(1).timestamp());
    }

    private Restaurant publishedRestaurant() {
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
        restaurant.publish();
        ReflectionTestUtils.setField(restaurant, "id", 1L);
        return restaurant;
    }

    private RestaurantTable table(Restaurant restaurant) {
        RestaurantTable table = new RestaurantTable(restaurant, 4);
        ReflectionTestUtils.setField(table, "id", 4L);
        return table;
    }

    private MenuItem menuItem(Restaurant restaurant, Long id, String name, BigDecimal price, int preparationTime) {
        Category category = new Category(restaurant, "Mains", 1);
        ReflectionTestUtils.setField(category, "id", 2L);
        MenuItem menuItem = new MenuItem(
                restaurant,
                category,
                name,
                "Description",
                price,
                null,
                FoodType.VEG,
                1,
                1,
                preparationTime,
                true
        );
        ReflectionTestUtils.setField(menuItem, "id", id);
        return menuItem;
    }

    private CustomerOrder order(
            Long id,
            Restaurant restaurant,
            RestaurantTable table,
            OrderStatus status,
            List<OrderItem> items
    ) {
        CustomerOrder order = new CustomerOrder(restaurant, table, null);
        items.forEach(order::addItem);
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
        ReflectionTestUtils.setField(order, "id", id);
        return order;
    }
}
