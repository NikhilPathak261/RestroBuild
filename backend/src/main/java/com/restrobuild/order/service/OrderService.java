package com.restrobuild.order.service;

import com.restrobuild.exception.BusinessException;
import com.restrobuild.exception.ResourceNotFoundException;
import com.restrobuild.menu.entity.MenuItem;
import com.restrobuild.menu.repository.MenuItemRepository;
import com.restrobuild.order.dto.OrderResponse;
import com.restrobuild.order.dto.OrderStatusResponse;
import com.restrobuild.order.dto.OrderTimelineStepResponse;
import com.restrobuild.order.dto.PlaceOrderItemRequest;
import com.restrobuild.order.dto.PlaceOrderRequest;
import com.restrobuild.order.entity.CustomerOrder;
import com.restrobuild.order.entity.OrderItem;
import com.restrobuild.order.entity.OrderStatus;
import com.restrobuild.order.mapper.OrderMapper;
import com.restrobuild.order.repository.CustomerOrderRepository;
import com.restrobuild.restaurant.entity.Restaurant;
import com.restrobuild.security.AuthenticatedUserService;
import com.restrobuild.table.entity.RestaurantTable;
import com.restrobuild.table.repository.RestaurantTableRepository;
import com.restrobuild.websocket.dto.OrderEventType;
import com.restrobuild.websocket.service.OrderEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.EnumSet;
import java.util.List;

@Service
public class OrderService {

    private final CustomerOrderRepository orderRepository;
    private final RestaurantTableRepository tableRepository;
    private final MenuItemRepository menuItemRepository;
    private final AuthenticatedUserService authenticatedUserService;
    private final OrderMapper orderMapper;
    private final OrderEventPublisher orderEventPublisher;

    public OrderService(
            CustomerOrderRepository orderRepository,
            RestaurantTableRepository tableRepository,
            MenuItemRepository menuItemRepository,
            AuthenticatedUserService authenticatedUserService,
            OrderMapper orderMapper,
            OrderEventPublisher orderEventPublisher
    ) {
        this.orderRepository = orderRepository;
        this.tableRepository = tableRepository;
        this.menuItemRepository = menuItemRepository;
        this.authenticatedUserService = authenticatedUserService;
        this.orderMapper = orderMapper;
        this.orderEventPublisher = orderEventPublisher;
    }

    @Transactional
    public OrderResponse placeOrder(PlaceOrderRequest request) {
        RestaurantTable table = tableRepository.findByIdAndActiveTrue(request.tableId())
                .orElseThrow(() -> new ResourceNotFoundException("Table not found."));

        Restaurant restaurant = table.getRestaurant();
        if (!restaurant.isActive() || !restaurant.isPublished()) {
            throw new ResourceNotFoundException("Restaurant website not found.");
        }

        CustomerOrder order = new CustomerOrder(restaurant, table, trimNullable(request.specialInstructions()));
        for (PlaceOrderItemRequest itemRequest : request.items()) {
            MenuItem menuItem = menuItemRepository.findByIdAndRestaurantIdAndHiddenFalseAndAvailableTrue(
                    itemRequest.menuItemId(),
                    restaurant.getId()
            ).orElseThrow(() -> new BusinessException("One or more menu items are unavailable."));

            order.addItem(new OrderItem(menuItem, itemRequest.quantity()));
        }

        CustomerOrder savedOrder = orderRepository.save(order);
        orderEventPublisher.publish(savedOrder, OrderEventType.NEW_ORDER);
        return orderMapper.toResponse(savedOrder);
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrder(Long orderId) {
        return orderMapper.toResponse(getOrderOrThrow(orderId));
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getCurrentTableOrders(Long tableId) {
        List<OrderStatus> activeStatuses = List.copyOf(EnumSet.of(
                OrderStatus.PENDING,
                OrderStatus.PREPARING,
                OrderStatus.READY
        ));

        return orderRepository.findByTableIdAndStatusInOrderByOrderedAtDesc(tableId, activeStatuses)
                .stream()
                .map(orderMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getRestaurantOrders(OrderStatus status) {
        return getRestaurantOrders(status, null, null);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getRestaurantOrders(OrderStatus status, Integer tableNumber, LocalDate date) {
        Restaurant restaurant = authenticatedUserService.getAuthenticatedOwnerRestaurant();
        var start = date == null ? null : date.atStartOfDay().toInstant(ZoneOffset.UTC);
        var end = date == null ? null : date.plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC);
        List<CustomerOrder> orders = orderRepository.findRestaurantOrders(restaurant.getId(), status, tableNumber, start, end);

        return orders.stream().map(orderMapper::toResponse).toList();
    }

    @Transactional
    public void cancelOrder(Long orderId) {
        Restaurant restaurant = authenticatedUserService.getAuthenticatedOwnerRestaurant();
        CustomerOrder order = getRestaurantOrder(orderId, restaurant.getId());

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new BusinessException("Only pending orders may be cancelled.");
        }

        order.cancel();
        orderEventPublisher.publish(order, OrderEventType.ORDER_CANCELLED);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getKitchenOrders(OrderStatus status) {
        Restaurant restaurant = authenticatedUserService.getAuthenticatedOwnerRestaurant();
        List<CustomerOrder> orders = status == null
                ? orderRepository.findByRestaurantIdAndStatusInOrderByOrderedAtDesc(
                        restaurant.getId(),
                        List.of(OrderStatus.PENDING, OrderStatus.PREPARING, OrderStatus.READY)
                )
                : orderRepository.findByRestaurantIdAndStatusOrderByOrderedAtDesc(restaurant.getId(), status);

        return orders.stream().map(orderMapper::toResponse).toList();
    }

    @Transactional
    public OrderResponse markPreparing(Long orderId) {
        Restaurant restaurant = authenticatedUserService.getAuthenticatedOwnerRestaurant();
        CustomerOrder order = getRestaurantOrder(orderId, restaurant.getId());

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new BusinessException("Only pending orders may be marked preparing.");
        }

        order.markPreparing();
        orderEventPublisher.publish(order, OrderEventType.ORDER_PREPARING);
        return orderMapper.toResponse(order);
    }

    @Transactional
    public OrderResponse markReady(Long orderId) {
        Restaurant restaurant = authenticatedUserService.getAuthenticatedOwnerRestaurant();
        CustomerOrder order = getRestaurantOrder(orderId, restaurant.getId());

        if (order.getStatus() != OrderStatus.PREPARING) {
            throw new BusinessException("Only preparing orders may be marked ready.");
        }

        order.markReady();
        orderEventPublisher.publish(order, OrderEventType.ORDER_READY);
        return orderMapper.toResponse(order);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getWaiterReadyOrders() {
        Restaurant restaurant = authenticatedUserService.getAuthenticatedOwnerRestaurant();
        return orderRepository.findByRestaurantIdAndStatusOrderByOrderedAtDesc(restaurant.getId(), OrderStatus.READY)
                .stream()
                .map(orderMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getWaiterServedOrders() {
        Restaurant restaurant = authenticatedUserService.getAuthenticatedOwnerRestaurant();
        return orderRepository.findByRestaurantIdAndStatusOrderByOrderedAtDesc(restaurant.getId(), OrderStatus.SERVED)
                .stream()
                .map(orderMapper::toResponse)
                .toList();
    }

    @Transactional
    public OrderResponse markServed(Long orderId) {
        Restaurant restaurant = authenticatedUserService.getAuthenticatedOwnerRestaurant();
        CustomerOrder order = getRestaurantOrder(orderId, restaurant.getId());

        if (order.getStatus() != OrderStatus.READY) {
            throw new BusinessException("Only ready orders may be marked served.");
        }

        order.markServed();
        orderEventPublisher.publish(order, OrderEventType.ORDER_SERVED);
        return orderMapper.toResponse(order);
    }

    @Transactional(readOnly = true)
    public OrderStatusResponse getOrderStatus(Long orderId) {
        CustomerOrder order = getOrderOrThrow(orderId);
        int estimatedTime = order.getItems().stream()
                .mapToInt(item -> item.getMenuItem().getPreparationTime())
                .max()
                .orElse(0);

        return new OrderStatusResponse(order.getId(), order.getStatus(), estimatedTime);
    }

    @Transactional(readOnly = true)
    public List<OrderTimelineStepResponse> getOrderTimeline(Long orderId) {
        CustomerOrder order = getOrderOrThrow(orderId);
        if (order.getStatus() == OrderStatus.CANCELLED) {
            return List.of(
                    timelineStep(OrderStatus.PENDING, "Placed", "The kitchen received your order.", "completed", order.getOrderedAt()),
                    timelineStep(OrderStatus.CANCELLED, "Cancelled", "This order was cancelled.", "current", order.getUpdatedAt())
            );
        }

        List<OrderStatus> statuses = List.of(
                OrderStatus.PENDING,
                OrderStatus.PREPARING,
                OrderStatus.READY,
                OrderStatus.SERVED
        );
        int currentIndex = statuses.indexOf(order.getStatus());

        return statuses.stream()
                .map(status -> {
                    int stepIndex = statuses.indexOf(status);
                    String state = getTimelineState(stepIndex, currentIndex);
                    return timelineStep(
                            status,
                            getTimelineLabel(status),
                            getTimelineDescription(status),
                            state,
                            getTimelineTimestamp(order, status, stepIndex, currentIndex)
                    );
                })
                .toList();
    }

    private CustomerOrder getOrderOrThrow(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found."));
    }

    private CustomerOrder getRestaurantOrder(Long orderId, Long restaurantId) {
        CustomerOrder order = getOrderOrThrow(orderId);
        if (!order.getTable().getRestaurant().getId().equals(restaurantId)) {
            throw new ResourceNotFoundException("Order not found.");
        }

        return order;
    }

    private String trimNullable(String value) {
        return value == null ? null : value.trim();
    }

    private OrderTimelineStepResponse timelineStep(
            OrderStatus status,
            String label,
            String description,
            String state,
            java.time.Instant timestamp
    ) {
        return new OrderTimelineStepResponse(status, label, description, state, timestamp);
    }

    private String getTimelineState(int stepIndex, int currentIndex) {
        if (stepIndex < currentIndex) {
            return "completed";
        }

        if (stepIndex == currentIndex) {
            return "current";
        }

        return "upcoming";
    }

    private java.time.Instant getTimelineTimestamp(CustomerOrder order, OrderStatus status, int stepIndex, int currentIndex) {
        if (status == OrderStatus.PENDING) {
            return order.getOrderedAt();
        }

        if (stepIndex == currentIndex) {
            return order.getUpdatedAt();
        }

        return null;
    }

    private String getTimelineLabel(OrderStatus status) {
        return switch (status) {
            case PENDING -> "Placed";
            case PREPARING -> "Preparing";
            case READY -> "Ready";
            case SERVED -> "Served";
            case CANCELLED -> "Cancelled";
        };
    }

    private String getTimelineDescription(OrderStatus status) {
        return switch (status) {
            case PENDING -> "The kitchen has received your order.";
            case PREPARING -> "Your food is being prepared.";
            case READY -> "Your order is ready for service.";
            case SERVED -> "Your order has been served.";
            case CANCELLED -> "This order was cancelled.";
        };
    }
}
