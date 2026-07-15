package com.restrobuild.cart.entity;

import com.restrobuild.menu.entity.MenuItem;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.math.BigDecimal;

@Entity
@Table(name = "public_cart_item")
public class PublicCartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cart_id", nullable = false)
    private PublicCart cart;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "menu_item_id", nullable = false)
    private MenuItem menuItem;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "special_instructions", length = 500)
    private String specialInstructions;

    protected PublicCartItem() {
    }

    public PublicCartItem(MenuItem menuItem, Integer quantity, String specialInstructions) {
        this.menuItem = menuItem;
        this.quantity = quantity;
        this.specialInstructions = specialInstructions;
    }

    void assignCart(PublicCart cart) {
        this.cart = cart;
    }

    public void update(Integer quantity, String specialInstructions) {
        this.quantity = quantity;
        this.specialInstructions = specialInstructions;
    }

    public BigDecimal getSubtotal() {
        return menuItem.getPrice().multiply(BigDecimal.valueOf(quantity));
    }

    public Long getId() {
        return id;
    }

    public PublicCart getCart() {
        return cart;
    }

    public MenuItem getMenuItem() {
        return menuItem;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public String getSpecialInstructions() {
        return specialInstructions;
    }
}
