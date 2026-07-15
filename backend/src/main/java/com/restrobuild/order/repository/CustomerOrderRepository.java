package com.restrobuild.order.repository;

import com.restrobuild.order.entity.CustomerOrder;
import com.restrobuild.order.entity.OrderStatus;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Collection;
import java.util.List;

public interface CustomerOrderRepository extends JpaRepository<CustomerOrder, Long> {

    List<CustomerOrder> findByTableIdAndStatusInOrderByOrderedAtDesc(Long tableId, Collection<OrderStatus> statuses);

    List<CustomerOrder> findByTableIdAndStatusInOrderByOrderedAtAsc(Long tableId, Collection<OrderStatus> statuses);

    List<CustomerOrder> findByRestaurantIdOrderByOrderedAtDesc(Long restaurantId);

    List<CustomerOrder> findTop10ByRestaurantIdOrderByOrderedAtDesc(Long restaurantId);

    List<CustomerOrder> findByRestaurantIdAndStatusOrderByOrderedAtDesc(Long restaurantId, OrderStatus status);

    List<CustomerOrder> findByRestaurantIdAndStatusInOrderByOrderedAtDesc(Long restaurantId, Collection<OrderStatus> statuses);

    boolean existsByTableIdAndStatusIn(Long tableId, Collection<OrderStatus> statuses);

    boolean existsByTableId(Long tableId);

    @Query("""
            select o from CustomerOrder o
            where o.restaurant.id = :restaurantId
            and (:status is null or o.status = :status)
            and (:tableNumber is null or o.table.tableNumber = :tableNumber)
            and (:start is null or o.orderedAt >= :start)
            and (:end is null or o.orderedAt < :end)
            order by o.orderedAt desc
            """)
    List<CustomerOrder> findRestaurantOrders(
            @Param("restaurantId") Long restaurantId,
            @Param("status") OrderStatus status,
            @Param("tableNumber") Integer tableNumber,
            @Param("start") Instant start,
            @Param("end") Instant end
    );

    long countByRestaurantId(Long restaurantId);

    long countByRestaurantIdAndOrderedAtBetween(Long restaurantId, Instant start, Instant end);

    @Query("select coalesce(sum(o.totalAmount), 0) from CustomerOrder o where o.restaurant.id = :restaurantId")
    BigDecimal sumRevenue(@Param("restaurantId") Long restaurantId);

    @Query("select coalesce(sum(o.totalAmount), 0) from CustomerOrder o where o.restaurant.id = :restaurantId and o.orderedAt between :start and :end")
    BigDecimal sumRevenueBetween(@Param("restaurantId") Long restaurantId, @Param("start") Instant start, @Param("end") Instant end);
}
