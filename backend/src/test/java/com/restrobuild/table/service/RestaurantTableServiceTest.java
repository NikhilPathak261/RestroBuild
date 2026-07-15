package com.restrobuild.table.service;

import com.restrobuild.exception.BusinessException;
import com.restrobuild.order.entity.OrderStatus;
import com.restrobuild.order.repository.CustomerOrderRepository;
import com.restrobuild.restaurant.entity.Restaurant;
import com.restrobuild.security.AuthenticatedUserService;
import com.restrobuild.table.entity.RestaurantTable;
import com.restrobuild.table.mapper.TableMapper;
import com.restrobuild.table.repository.RestaurantTableRepository;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class RestaurantTableServiceTest {

    private final RestaurantTableRepository tableRepository = mock(RestaurantTableRepository.class);
    private final CustomerOrderRepository orderRepository = mock(CustomerOrderRepository.class);
    private final AuthenticatedUserService authenticatedUserService = mock(AuthenticatedUserService.class);
    private final RestaurantTableService service = new RestaurantTableService(
            tableRepository,
            orderRepository,
            authenticatedUserService,
            new TableMapper(),
            "http://localhost:5173"
    );

    @Test
    void deleteTableRejectsTablesWithActiveOrders() {
        Restaurant restaurant = restaurant();
        RestaurantTable table = table(restaurant);
        List<OrderStatus> activeStatuses = List.of(OrderStatus.PENDING, OrderStatus.PREPARING, OrderStatus.READY);
        when(authenticatedUserService.getAuthenticatedOwnerRestaurant()).thenReturn(restaurant);
        when(tableRepository.findByIdAndRestaurantIdAndActiveTrue(4L, 1L)).thenReturn(Optional.of(table));
        when(orderRepository.existsByTableIdAndStatusIn(4L, activeStatuses)).thenReturn(true);

        assertThrows(BusinessException.class, () -> service.deleteTable(4L));

        verify(tableRepository, never()).delete(table);
    }

    @Test
    void deleteTableDeactivatesTablesWithOnlyHistoricalOrders() {
        Restaurant restaurant = restaurant();
        RestaurantTable table = table(restaurant);
        List<OrderStatus> activeStatuses = List.of(OrderStatus.PENDING, OrderStatus.PREPARING, OrderStatus.READY);
        when(authenticatedUserService.getAuthenticatedOwnerRestaurant()).thenReturn(restaurant);
        when(tableRepository.findByIdAndRestaurantIdAndActiveTrue(4L, 1L)).thenReturn(Optional.of(table));
        when(orderRepository.existsByTableIdAndStatusIn(4L, activeStatuses)).thenReturn(false);
        when(orderRepository.existsByTableId(4L)).thenReturn(true);

        service.deleteTable(4L);

        assertFalse(table.isActive());
        verify(tableRepository, never()).delete(table);
    }

    @Test
    void deleteTableDeletesUnusedTables() {
        Restaurant restaurant = restaurant();
        RestaurantTable table = table(restaurant);
        List<OrderStatus> activeStatuses = List.of(OrderStatus.PENDING, OrderStatus.PREPARING, OrderStatus.READY);
        when(authenticatedUserService.getAuthenticatedOwnerRestaurant()).thenReturn(restaurant);
        when(tableRepository.findByIdAndRestaurantIdAndActiveTrue(4L, 1L)).thenReturn(Optional.of(table));
        when(orderRepository.existsByTableIdAndStatusIn(4L, activeStatuses)).thenReturn(false);
        when(orderRepository.existsByTableId(4L)).thenReturn(false);

        service.deleteTable(4L);

        verify(tableRepository).delete(table);
    }

    private Restaurant restaurant() {
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
        return restaurant;
    }

    private RestaurantTable table(Restaurant restaurant) {
        RestaurantTable table = new RestaurantTable(restaurant, 4);
        ReflectionTestUtils.setField(table, "id", 4L);
        return table;
    }
}
