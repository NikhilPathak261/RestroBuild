package com.restrobuild.order.repository;

import com.restrobuild.order.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    @Query("""
            select oi.menuItem.id, oi.menuItem.name, sum(oi.quantity)
            from OrderItem oi
            where oi.order.restaurant.id = :restaurantId
            group by oi.menuItem.id, oi.menuItem.name
            order by sum(oi.quantity) desc
            """)
    List<Object[]> findTopMenuItems(@Param("restaurantId") Long restaurantId);

    @Query("""
            select oi.menuItem.id, oi.menuItem.name, sum(oi.quantity)
            from OrderItem oi
            where oi.order.restaurant.id = :restaurantId
            group by oi.menuItem.id, oi.menuItem.name
            order by sum(oi.quantity) asc
            """)
    List<Object[]> findBottomMenuItems(@Param("restaurantId") Long restaurantId);

    @Query("""
            select oi.menuItem.category.id, oi.menuItem.category.name, sum(oi.quantity)
            from OrderItem oi
            where oi.order.restaurant.id = :restaurantId
            group by oi.menuItem.category.id, oi.menuItem.category.name
            order by sum(oi.quantity) desc
            """)
    List<Object[]> findCategoryStats(@Param("restaurantId") Long restaurantId);
}
