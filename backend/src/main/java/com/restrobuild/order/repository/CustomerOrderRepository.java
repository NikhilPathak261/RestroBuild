package com.restrobuild.order.repository;

import com.restrobuild.order.entity.CustomerOrder;
import com.restrobuild.order.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface CustomerOrderRepository extends JpaRepository<CustomerOrder, Long> {

    List<CustomerOrder> findByTableIdAndStatusInOrderByOrderedAtDesc(Long tableId, Collection<OrderStatus> statuses);

    List<CustomerOrder> findByRestaurantIdOrderByOrderedAtDesc(Long restaurantId);

    List<CustomerOrder> findByRestaurantIdAndStatusOrderByOrderedAtDesc(Long restaurantId, OrderStatus status);

    List<CustomerOrder> findByRestaurantIdAndStatusInOrderByOrderedAtDesc(Long restaurantId, Collection<OrderStatus> statuses);
}
