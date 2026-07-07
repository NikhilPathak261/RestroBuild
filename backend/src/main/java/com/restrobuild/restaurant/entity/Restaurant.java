package com.restrobuild.restaurant.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "restaurant")
public class Restaurant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 140)
    private String slug;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private String phone;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "opening_hours", nullable = false)
    private String openingHours;

    @Column(name = "logo_url")
    private String logoUrl;

    @Column(name = "cover_image_url")
    private String coverImageUrl;

    @Column(name = "primary_color")
    private String primaryColor;

    @Column(name = "secondary_color")
    private String secondaryColor;

    @Column(name = "template_name")
    private String templateName;

    @Column(length = 2000)
    private String about;

    @Column(name = "is_published", nullable = false)
    private boolean published = false;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected Restaurant() {
    }

    public Restaurant(
            String name,
            String description,
            String address,
            String phone,
            String email,
            String openingHours,
            String slug
    ) {
        this.name = name;
        this.slug = slug;
        this.description = description;
        this.address = address;
        this.phone = phone;
        this.email = email;
        this.openingHours = openingHours;
        this.primaryColor = "#B42318";
        this.secondaryColor = "#FFFFFF";
        this.templateName = "MODERN";
    }

    public void updateProfile(
            String name,
            String description,
            String address,
            String phone,
            String email,
            String openingHours
    ) {
        this.name = name;
        this.description = description;
        this.address = address;
        this.phone = phone;
        this.email = email;
        this.openingHours = openingHours;
    }

    public void updateTheme(String templateName, String primaryColor, String secondaryColor) {
        this.templateName = templateName;
        this.primaryColor = primaryColor;
        this.secondaryColor = secondaryColor;
    }

    public void updateAbout(String about) {
        this.about = about;
    }

    public void publish() {
        this.published = true;
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

    public String getName() {
        return name;
    }

    public String getSlug() {
        return slug;
    }

    public String getDescription() {
        return description;
    }

    public String getAddress() {
        return address;
    }

    public String getPhone() {
        return phone;
    }

    public String getEmail() {
        return email;
    }

    public String getOpeningHours() {
        return openingHours;
    }

    public String getLogoUrl() {
        return logoUrl;
    }

    public String getCoverImageUrl() {
        return coverImageUrl;
    }

    public String getPrimaryColor() {
        return primaryColor;
    }

    public String getSecondaryColor() {
        return secondaryColor;
    }

    public String getTemplateName() {
        return templateName;
    }

    public String getAbout() {
        return about;
    }

    public boolean isPublished() {
        return published;
    }

    public boolean isActive() {
        return active;
    }
}
