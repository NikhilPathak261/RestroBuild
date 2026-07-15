package com.restrobuild.cart.controller;

import com.restrobuild.cart.dto.AddCartItemRequest;
import com.restrobuild.cart.dto.CartResponse;
import com.restrobuild.cart.dto.UpdateCartItemRequest;
import com.restrobuild.cart.service.CartService;
import com.restrobuild.common.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class CartController {

    public static final String CART_TOKEN_HEADER = "X-Cart-Token";

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping("/api/cart")
    public ResponseEntity<ApiResponse<CartResponse>> getCart(
            @RequestHeader(value = CART_TOKEN_HEADER, required = false) String cartToken
    ) {
        return ResponseEntity.ok(ApiResponse.success("Cart fetched successfully.", cartService.getCart(cartToken)));
    }

    @PostMapping("/api/cart/items")
    public ResponseEntity<ApiResponse<CartResponse>> addItem(
            @RequestHeader(value = CART_TOKEN_HEADER, required = false) String cartToken,
            @Valid @RequestBody AddCartItemRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Cart updated successfully.", cartService.addItem(cartToken, request)));
    }

    @PutMapping("/api/cart/items/{cartItemId}")
    public ResponseEntity<ApiResponse<CartResponse>> updateItem(
            @RequestHeader(value = CART_TOKEN_HEADER, required = false) String cartToken,
            @PathVariable Long cartItemId,
            @Valid @RequestBody UpdateCartItemRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Cart updated successfully.", cartService.updateItem(cartToken, cartItemId, request)));
    }

    @DeleteMapping("/api/cart/items/{cartItemId}")
    public ResponseEntity<ApiResponse<CartResponse>> removeItem(
            @RequestHeader(value = CART_TOKEN_HEADER, required = false) String cartToken,
            @PathVariable Long cartItemId
    ) {
        return ResponseEntity.ok(ApiResponse.success("Cart item removed successfully.", cartService.removeItem(cartToken, cartItemId)));
    }

    @DeleteMapping("/api/cart")
    public ResponseEntity<ApiResponse<Void>> clearCart(
            @RequestHeader(value = CART_TOKEN_HEADER, required = false) String cartToken
    ) {
        cartService.clearCart(cartToken);
        return ResponseEntity.ok(ApiResponse.success("Cart cleared successfully."));
    }
}
