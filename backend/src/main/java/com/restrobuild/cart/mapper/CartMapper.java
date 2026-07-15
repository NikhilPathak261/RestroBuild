package com.restrobuild.cart.mapper;

import com.restrobuild.cart.dto.CartItemResponse;
import com.restrobuild.cart.dto.CartResponse;
import com.restrobuild.cart.entity.PublicCart;
import com.restrobuild.cart.entity.PublicCartItem;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class CartMapper {

    public CartResponse toResponse(PublicCart cart) {
        var items = cart.getItems().stream()
                .map(this::toItemResponse)
                .toList();
        BigDecimal subtotal = items.stream()
                .map(CartItemResponse::subtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new CartResponse(cart.getToken(), items, subtotal);
    }

    public CartResponse emptyResponse(String cartToken) {
        return new CartResponse(cartToken, java.util.List.of(), BigDecimal.ZERO);
    }

    private CartItemResponse toItemResponse(PublicCartItem item) {
        return new CartItemResponse(
                item.getId(),
                item.getMenuItem().getId(),
                item.getMenuItem().getName(),
                item.getQuantity(),
                item.getMenuItem().getPrice(),
                item.getSubtotal(),
                item.getSpecialInstructions()
        );
    }
}
