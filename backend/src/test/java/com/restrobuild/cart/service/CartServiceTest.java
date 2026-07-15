package com.restrobuild.cart.service;

import com.restrobuild.cart.dto.AddCartItemRequest;
import com.restrobuild.cart.dto.UpdateCartItemRequest;
import com.restrobuild.cart.entity.PublicCart;
import com.restrobuild.cart.entity.PublicCartItem;
import com.restrobuild.cart.mapper.CartMapper;
import com.restrobuild.cart.repository.PublicCartItemRepository;
import com.restrobuild.cart.repository.PublicCartRepository;
import com.restrobuild.category.entity.Category;
import com.restrobuild.exception.BusinessException;
import com.restrobuild.exception.ResourceNotFoundException;
import com.restrobuild.menu.entity.FoodType;
import com.restrobuild.menu.entity.MenuItem;
import com.restrobuild.menu.repository.MenuItemRepository;
import com.restrobuild.restaurant.entity.Restaurant;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class CartServiceTest {

    private final PublicCartRepository cartRepository = mock(PublicCartRepository.class);
    private final PublicCartItemRepository cartItemRepository = mock(PublicCartItemRepository.class);
    private final MenuItemRepository menuItemRepository = mock(MenuItemRepository.class);
    private final CartService service = new CartService(
            cartRepository,
            cartItemRepository,
            menuItemRepository,
            new CartMapper()
    );

    @Test
    void getCartReturnsEmptyCartWhenTokenIsMissing() {
        var response = service.getCart(null);

        assertEquals(null, response.cartToken());
        assertEquals(0, response.items().size());
        assertEquals(0, BigDecimal.ZERO.compareTo(response.subtotal()));
    }

    @Test
    void addItemCreatesCartWhenTokenIsMissing() {
        MenuItem menuItem = menuItem(restaurant("Spice House", 1L), 10L);
        when(menuItemRepository.findById(10L)).thenReturn(Optional.of(menuItem));
        when(cartRepository.save(any(PublicCart.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = service.addItem(null, new AddCartItemRequest(10L, 2, "Less spicy"));

        assertEquals(1, response.items().size());
        assertEquals("Paneer Tikka", response.items().get(0).menuItemName());
        assertEquals(0, BigDecimal.valueOf(500).compareTo(response.subtotal()));
    }

    @Test
    void addItemRejectsUnavailableMenuItems() {
        MenuItem menuItem = menuItem(restaurant("Spice House", 1L), 10L);
        menuItem.updateAvailability(false);
        when(menuItemRepository.findById(10L)).thenReturn(Optional.of(menuItem));

        assertThrows(BusinessException.class, () -> service.addItem(null, new AddCartItemRequest(10L, 1, null)));
    }

    @Test
    void updateItemRequiresMatchingCartToken() {
        when(cartItemRepository.findByIdAndCartToken(3L, "cart-token")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                service.updateItem("cart-token", 3L, new UpdateCartItemRequest(2, "No onion"))
        );
    }

    @Test
    void removeItemDeletesMatchedItem() {
        Restaurant restaurant = restaurant("Spice House", 1L);
        PublicCart cart = new PublicCart("cart-token", restaurant);
        PublicCartItem item = new PublicCartItem(menuItem(restaurant, 10L), 1, null);
        cart.addItem(item);
        ReflectionTestUtils.setField(item, "id", 3L);
        when(cartItemRepository.findByIdAndCartToken(3L, "cart-token")).thenReturn(Optional.of(item));

        var response = service.removeItem("cart-token", 3L);

        assertEquals(0, response.items().size());
        verify(cartItemRepository).delete(item);
    }

    private Restaurant restaurant(String name, Long id) {
        Restaurant restaurant = new Restaurant(
                name,
                "Demo restaurant",
                "Demo Street",
                "1234567890",
                "hello-" + id + "@demo.test",
                "11 AM - 11 PM",
                null,
                null,
                "restaurant-" + id
        );
        ReflectionTestUtils.setField(restaurant, "id", id);
        ReflectionTestUtils.setField(restaurant, "published", true);
        return restaurant;
    }

    private MenuItem menuItem(Restaurant restaurant, Long id) {
        Category category = new Category(restaurant, "Mains", 1);
        ReflectionTestUtils.setField(category, "id", 2L);
        MenuItem menuItem = new MenuItem(
                restaurant,
                category,
                "Paneer Tikka",
                "Smoky paneer",
                BigDecimal.valueOf(250),
                null,
                FoodType.VEG,
                2,
                0,
                15,
                true
        );
        ReflectionTestUtils.setField(menuItem, "id", id);
        return menuItem;
    }
}
