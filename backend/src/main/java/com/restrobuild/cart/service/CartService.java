package com.restrobuild.cart.service;

import com.restrobuild.cart.dto.AddCartItemRequest;
import com.restrobuild.cart.dto.CartResponse;
import com.restrobuild.cart.dto.UpdateCartItemRequest;
import com.restrobuild.cart.entity.PublicCart;
import com.restrobuild.cart.entity.PublicCartItem;
import com.restrobuild.cart.mapper.CartMapper;
import com.restrobuild.cart.repository.PublicCartItemRepository;
import com.restrobuild.cart.repository.PublicCartRepository;
import com.restrobuild.exception.BusinessException;
import com.restrobuild.exception.ResourceNotFoundException;
import com.restrobuild.menu.entity.MenuItem;
import com.restrobuild.menu.repository.MenuItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class CartService {

    private final PublicCartRepository cartRepository;
    private final PublicCartItemRepository cartItemRepository;
    private final MenuItemRepository menuItemRepository;
    private final CartMapper cartMapper;

    public CartService(
            PublicCartRepository cartRepository,
            PublicCartItemRepository cartItemRepository,
            MenuItemRepository menuItemRepository,
            CartMapper cartMapper
    ) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.menuItemRepository = menuItemRepository;
        this.cartMapper = cartMapper;
    }

    @Transactional(readOnly = true)
    public CartResponse getCart(String cartToken) {
        if (isBlank(cartToken)) {
            return cartMapper.emptyResponse(null);
        }

        return cartRepository.findByToken(cartToken)
                .map(cartMapper::toResponse)
                .orElseGet(() -> cartMapper.emptyResponse(cartToken));
    }

    @Transactional
    public CartResponse addItem(String cartToken, AddCartItemRequest request) {
        MenuItem menuItem = menuItemRepository.findById(request.menuItemId())
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found."));
        if (menuItem.isHidden() || !menuItem.isAvailable() || !menuItem.getRestaurant().isActive()
                || !menuItem.getRestaurant().isPublished()) {
            throw new BusinessException("Menu item is unavailable.");
        }

        PublicCart cart = getOrCreateCart(cartToken, menuItem);
        if (!cart.getRestaurant().getId().equals(menuItem.getRestaurant().getId())) {
            throw new BusinessException("Cart can contain items from one restaurant only.");
        }

        PublicCartItem existingItem = cart.getItems().stream()
                .filter(item -> item.getMenuItem().getId().equals(menuItem.getId()))
                .findFirst()
                .orElse(null);
        if (existingItem == null) {
            cart.addItem(new PublicCartItem(menuItem, request.quantity(), trimNullable(request.specialInstructions())));
        } else {
            existingItem.update(
                    Math.min(99, existingItem.getQuantity() + request.quantity()),
                    trimNullable(request.specialInstructions())
            );
        }

        return cartMapper.toResponse(cartRepository.save(cart));
    }

    @Transactional
    public CartResponse updateItem(String cartToken, Long cartItemId, UpdateCartItemRequest request) {
        PublicCartItem item = getCartItem(cartToken, cartItemId);
        item.update(request.quantity(), trimNullable(request.specialInstructions()));
        return cartMapper.toResponse(item.getCart());
    }

    @Transactional
    public CartResponse removeItem(String cartToken, Long cartItemId) {
        PublicCartItem item = getCartItem(cartToken, cartItemId);
        PublicCart cart = item.getCart();
        cart.getItems().remove(item);
        cartItemRepository.delete(item);
        return cartMapper.toResponse(cart);
    }

    @Transactional
    public void clearCart(String cartToken) {
        if (isBlank(cartToken)) {
            return;
        }

        cartRepository.findByToken(cartToken).ifPresent(PublicCart::clear);
    }

    private PublicCart getOrCreateCart(String cartToken, MenuItem menuItem) {
        if (!isBlank(cartToken)) {
            return cartRepository.findByToken(cartToken)
                    .orElseGet(() -> cartRepository.save(new PublicCart(cartToken, menuItem.getRestaurant())));
        }

        return cartRepository.save(new PublicCart(UUID.randomUUID().toString(), menuItem.getRestaurant()));
    }

    private PublicCartItem getCartItem(String cartToken, Long cartItemId) {
        if (isBlank(cartToken)) {
            throw new ResourceNotFoundException("Cart not found.");
        }

        return cartItemRepository.findByIdAndCartToken(cartItemId, cartToken)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found."));
    }

    private String trimNullable(String value) {
        return value == null ? null : value.trim();
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
