package com.restrobuild.menu.entity;

import com.restrobuild.category.entity.Category;
import com.restrobuild.restaurant.entity.Restaurant;
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
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "menu_item")
public class MenuItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "image_url")
    private String imageUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "food_type", nullable = false)
    private FoodType foodType;

    @Column(name = "spicy_level", nullable = false)
    @Min(0)
    @Max(3)
    private Integer spicyLevel;

    @Column(name = "sweet_level", nullable = false)
    @Min(0)
    @Max(3)
    private Integer sweetLevel;

    @Column(name = "preparation_time", nullable = false)
    private Integer preparationTime;

    @Column(name = "is_available", nullable = false)
    private boolean available;

    @Column(name = "is_hidden", nullable = false)
    private boolean hidden = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected MenuItem() {
    }

    public MenuItem(
            Restaurant restaurant,
            Category category,
            String name,
            String description,
            BigDecimal price,
            String imageUrl,
            FoodType foodType,
            Integer spicyLevel,
            Integer sweetLevel,
            Integer preparationTime,
            boolean available
    ) {
        this.restaurant = restaurant;
        this.category = category;
        this.name = name;
        this.description = description;
        this.price = price;
        this.imageUrl = imageUrl;
        this.foodType = foodType;
        this.spicyLevel = spicyLevel;
        this.sweetLevel = sweetLevel;
        this.preparationTime = preparationTime;
        this.available = available;
    }

    public void update(
            Category category,
            String name,
            String description,
            BigDecimal price,
            String imageUrl,
            FoodType foodType,
            Integer spicyLevel,
            Integer sweetLevel,
            Integer preparationTime,
            boolean available
    ) {
        this.category = category;
        this.name = name;
        this.description = description;
        this.price = price;
        this.imageUrl = imageUrl;
        this.foodType = foodType;
        this.spicyLevel = spicyLevel;
        this.sweetLevel = sweetLevel;
        this.preparationTime = preparationTime;
        this.available = available;
    }

    public void hide() {
        this.hidden = true;
    }

    public void show() {
        this.hidden = false;
    }

    public void updateAvailability(boolean available) {
        this.available = available;
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

    public Category getCategory() {
        return category;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public FoodType getFoodType() {
        return foodType;
    }

    public Integer getSpicyLevel() {
        return spicyLevel;
    }

    public Integer getSweetLevel() {
        return sweetLevel;
    }

    public Integer getPreparationTime() {
        return preparationTime;
    }

    public boolean isAvailable() {
        return available;
    }

    public boolean isHidden() {
        return hidden;
    }
}
