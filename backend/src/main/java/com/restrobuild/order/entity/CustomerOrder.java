package com.restrobuild.order.entity;

import com.restrobuild.restaurant.entity.Restaurant;
import com.restrobuild.table.entity.RestaurantTable;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "customer_order")
public class CustomerOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "table_id", nullable = false)
    private RestaurantTable table;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status = OrderStatus.PENDING;

    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(name = "special_instructions", length = 500)
    private String specialInstructions;

    @Column(name = "ordered_at", nullable = false, updatable = false)
    private Instant orderedAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    protected CustomerOrder() {
    }

    public CustomerOrder(Restaurant restaurant, RestaurantTable table, String specialInstructions) {
        this.restaurant = restaurant;
        this.table = table;
        this.specialInstructions = specialInstructions;
    }

    public void addItem(OrderItem item) {
        item.assignOrder(this);
        items.add(item);
        totalAmount = totalAmount.add(item.getSubtotal());
    }

    public void cancel() {
        status = OrderStatus.CANCELLED;
    }

    public void markPreparing() {
        status = OrderStatus.PREPARING;
    }

    public void markReady() {
        status = OrderStatus.READY;
    }

    public void markServed() {
        status = OrderStatus.SERVED;
    }

    @PrePersist
    void prePersist() {
        Instant now = Instant.now();
        orderedAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public RestaurantTable getTable() {
        return table;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public String getSpecialInstructions() {
        return specialInstructions;
    }

    public Instant getOrderedAt() {
        return orderedAt;
    }

    public List<OrderItem> getItems() {
        return items;
    }
}
