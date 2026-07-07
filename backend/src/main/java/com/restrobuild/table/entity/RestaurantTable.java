package com.restrobuild.table.entity;

import com.restrobuild.restaurant.entity.Restaurant;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.Instant;

@Entity
@Table(
        name = "restaurant_table",
        uniqueConstraints = @UniqueConstraint(name = "uk_table_restaurant_number", columnNames = {"restaurant_id", "table_number"})
)
public class RestaurantTable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    @Column(name = "table_number", nullable = false)
    private Integer tableNumber;

    @Column(name = "qr_code_url")
    private String qrCodeUrl;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected RestaurantTable() {
    }

    public RestaurantTable(Restaurant restaurant, Integer tableNumber) {
        this.restaurant = restaurant;
        this.tableNumber = tableNumber;
    }

    public void updateTableNumber(Integer tableNumber) {
        this.tableNumber = tableNumber;
    }

    public void updateQrCodeUrl(String qrCodeUrl) {
        this.qrCodeUrl = qrCodeUrl;
    }

    public void deactivate() {
        this.active = false;
    }

    @PrePersist
    void prePersist() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public Restaurant getRestaurant() {
        return restaurant;
    }

    public Integer getTableNumber() {
        return tableNumber;
    }

    public String getQrCodeUrl() {
        return qrCodeUrl;
    }

    public boolean isActive() {
        return active;
    }
}
