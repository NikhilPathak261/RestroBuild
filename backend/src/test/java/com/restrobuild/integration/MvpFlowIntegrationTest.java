package com.restrobuild.integration;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Map;
import java.util.UUID;

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class MvpFlowIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void verifiesOwnerStaffCartOrderReviewAndAnalyticsMvpFlow() throws Exception {
        String suffix = UUID.randomUUID().toString().substring(0, 8);
        String ownerEmail = "owner-" + suffix + "@restrobuild.test";
        String ownerPassword = "OwnerPass123";

        registerOwner("MVP Owner", ownerEmail, ownerPassword);
        String ownerToken = login(ownerEmail, ownerPassword, "ROLE_OWNER");

        mockMvc.perform(get("/api/categories"))
                .andExpect(status().isUnauthorized());

        JsonNode restaurant = json(postAuthorized("/api/restaurants", ownerToken, Map.of(
                "name", "MVP Bistro " + suffix,
                "description", "Automated MVP verification restaurant",
                "address", "1 Test Street",
                "phone", "+91 90000 00000",
                "email", "mvp-" + suffix + "@restrobuild.test",
                "openingHours", "Mon-Sun 10:00 AM - 10:00 PM",
                "logoUrl", "",
                "coverImageUrl", ""
        ))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.slug", notNullValue())));
        String restaurantSlug = restaurant.at("/data/slug").asText();

        getAuthorized("/api/categories", ownerToken)
                .andExpect(status().isOk());

        putAuthorized("/api/restaurants/me", ownerToken, Map.of(
                "name", "MVP Bistro Updated " + suffix,
                "description", "Updated restaurant profile",
                "address", "2 Test Street",
                "phone", "+91 90000 00001",
                "email", "mvp-updated-" + suffix + "@restrobuild.test",
                "openingHours", "Mon-Sun 9:00 AM - 11:00 PM",
                "logoUrl", "",
                "coverImageUrl", ""
        ))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.name", is("MVP Bistro Updated " + suffix)));

        postAuthorized("/api/website/publish", ownerToken, Map.of())
                .andExpect(status().isOk());

        JsonNode category = json(postAuthorized("/api/categories", ownerToken, Map.of(
                "name", "Mains",
                "displayOrder", 1
        ))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.name", is("Mains"))));
        long categoryId = category.at("/data/id").asLong();

        putAuthorized("/api/categories/" + categoryId, ownerToken, Map.of(
                "name", "Signature Mains",
                "displayOrder", 2
        ))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.name", is("Signature Mains")));

        JsonNode menuItem = json(postAuthorized("/api/menu-items", ownerToken, Map.of(
                "categoryId", categoryId,
                "name", "Paneer Lababdar",
                "description", "Creamy paneer curry",
                "price", 320,
                "imageUrl", "",
                "foodType", "VEG",
                "spicyLevel", 2,
                "sweetLevel", 1,
                "preparationTime", 18,
                "available", true
        ))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.available", is(true))));
        long menuItemId = menuItem.at("/data/id").asLong();

        patchAuthorized("/api/menu-items/" + menuItemId + "/availability", ownerToken, Map.of("available", false))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.available", is(false)));
        patchAuthorized("/api/menu-items/" + menuItemId + "/availability", ownerToken, Map.of("available", true))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.available", is(true)));
        patchAuthorized("/api/menu-items/" + menuItemId + "/hide", ownerToken, Map.of())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.hidden", is(true)));
        patchAuthorized("/api/menu-items/" + menuItemId + "/show", ownerToken, Map.of())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.hidden", is(false)));

        JsonNode tables = json(postAuthorized("/api/tables", ownerToken, Map.of("numberOfTables", 1))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data", hasSize(1))));
        long tableId = tables.at("/data/0/id").asLong();

        String kitchenEmail = "kitchen-" + suffix + "@restrobuild.test";
        String waiterEmail = "waiter-" + suffix + "@restrobuild.test";
        String staffPassword = "StaffPass123";
        postAuthorized("/api/staff", ownerToken, Map.of(
                "name", "MVP Kitchen",
                "email", kitchenEmail,
                "password", staffPassword,
                "role", "KITCHEN"
        ))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.role", is("KITCHEN")));
        postAuthorized("/api/staff", ownerToken, Map.of(
                "name", "MVP Waiter",
                "email", waiterEmail,
                "password", staffPassword,
                "role", "WAITER"
        ))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.role", is("WAITER")));

        String kitchenToken = login(kitchenEmail, staffPassword, "ROLE_KITCHEN");
        String waiterToken = login(waiterEmail, staffPassword, "ROLE_WAITER");
        postAuthorized("/api/staff", kitchenToken, Map.of(
                "name", "Forbidden",
                "email", "forbidden-" + suffix + "@restrobuild.test",
                "password", staffPassword,
                "role", "WAITER"
        ))
                .andExpect(status().isForbidden());

        JsonNode secondOwnerRestaurant = createSecondOwnerWithRestaurant(suffix);
        long secondOwnerCategoryId = secondOwnerRestaurant.at("/categoryId").asLong();
        putAuthorized("/api/categories/" + secondOwnerCategoryId, ownerToken, Map.of(
                "name", "Cross Tenant",
                "displayOrder", 1
        ))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/api/public/" + restaurantSlug + "/menu"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].id", is((int) menuItemId)));

        JsonNode cart = json(postJson("/api/cart/items", Map.of(
                "menuItemId", menuItemId,
                "quantity", 2,
                "specialInstructions", "Less spicy"
        ))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.cartToken", notNullValue()))
                .andExpect(jsonPath("$.data.items[0].menuItemId", is((int) menuItemId))));
        String cartToken = cart.at("/data/cartToken").asText();
        long cartItemId = cart.at("/data/items/0/id").asLong();

        putJsonWithCartToken("/api/cart/items/" + cartItemId, cartToken, Map.of(
                "quantity", 3,
                "specialInstructions", "No onion"
        ))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.items[0].quantity", is(3)));
        deleteWithCartToken("/api/cart/items/" + cartItemId, cartToken)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.items", hasSize(0)));
        cart = json(postJson("/api/cart/items", Map.of(
                "menuItemId", menuItemId,
                "quantity", 1,
                "specialInstructions", "Serve hot"
        ))
                .andExpect(status().isOk())
        );
        cartToken = cart.at("/data/cartToken").asText();
        deleteWithCartToken("/api/cart", cartToken)
                .andExpect(status().isOk());

        JsonNode order = json(postJson("/api/orders", Map.of(
                "tableId", tableId,
                "items", new Object[]{Map.of("menuItemId", menuItemId, "quantity", 1)},
                "specialInstructions", "Serve hot"
        ))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.status", is("PENDING"))));
        long orderId = order.at("/data/id").asLong();
        long orderItemId = order.at("/data/items/0/id").asLong();

        patchAuthorized("/api/waiter/orders/" + orderId + "/served", waiterToken, Map.of())
                .andExpect(status().isUnprocessableEntity());

        patchAuthorized("/api/kitchen/orders/" + orderId + "/prepare", kitchenToken, Map.of())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status", is("PREPARING")));
        patchAuthorized("/api/kitchen/orders/" + orderId + "/ready", kitchenToken, Map.of())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status", is("READY")));
        patchAuthorized("/api/waiter/orders/" + orderId + "/served", waiterToken, Map.of())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status", is("SERVED")));

        postJson("/api/reviews", Map.of(
                "orderItemId", orderItemId,
                "rating", 5,
                "comment", "Excellent automated meal"
        ))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.visible", is(true)));

        JsonNode pendingOrder = json(postJson("/api/orders", Map.of(
                "tableId", tableId,
                "items", new Object[]{Map.of("menuItemId", menuItemId, "quantity", 1)},
                "specialInstructions", ""
        ))
                .andExpect(status().isCreated())
        );
        long pendingOrderItemId = pendingOrder.at("/data/items/0/id").asLong();
        postJson("/api/reviews", Map.of(
                "orderItemId", pendingOrderItemId,
                "rating", 4,
                "comment", "Too early"
        ))
                .andExpect(status().isUnprocessableEntity());

        getAuthorized("/api/reviews", ownerToken)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].comment", is("Excellent automated meal")));
        getAuthorized("/api/orders", ownerToken)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(2))));
        getAuthorized("/api/analytics/summary", ownerToken)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalOrders", greaterThanOrEqualTo(2)))
                .andExpect(jsonPath("$.data.totalRevenue", not("0.00")))
                .andExpect(jsonPath("$.data.averageRating", is(5.0)));
        getAuthorized("/api/analytics/menu-items/top", ownerToken)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].menuItemName", is("Paneer Lababdar")));
    }

    private JsonNode createSecondOwnerWithRestaurant(String suffix) throws Exception {
        String email = "owner-two-" + suffix + "@restrobuild.test";
        String password = "OwnerPass123";
        registerOwner("Second Owner", email, password);
        String token = login(email, password, "ROLE_OWNER");
        postAuthorized("/api/restaurants", token, Map.of(
                "name", "Second Bistro " + suffix,
                "description", "Second tenant",
                "address", "9 Test Street",
                "phone", "+91 90000 00009",
                "email", "second-" + suffix + "@restrobuild.test",
                "openingHours", "Mon-Sun 10:00 AM - 10:00 PM",
                "logoUrl", "",
                "coverImageUrl", ""
        ))
                .andExpect(status().isCreated());
        JsonNode category = json(postAuthorized("/api/categories", token, Map.of(
                "name", "Tenant Category",
                "displayOrder", 1
        ))
                .andExpect(status().isCreated())
        );
        return objectMapper.createObjectNode().put("categoryId", category.at("/data/id").asLong());
    }

    private void registerOwner(String name, String email, String password) throws Exception {
        postJson("/api/auth/register", Map.of(
                "name", name,
                "email", email,
                "password", password
        ))
                .andExpect(status().isCreated());
    }

    private String login(String email, String password, String expectedRole) throws Exception {
        JsonNode response = json(postJson("/api/auth/login", Map.of(
                "email", email,
                "password", password
        ))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.role", is(expectedRole))));
        return response.at("/data/accessToken").asText();
    }

    private ResultActions getAuthorized(String url, String token) throws Exception {
        return mockMvc.perform(get(url).header(HttpHeaders.AUTHORIZATION, bearer(token)));
    }

    private ResultActions postAuthorized(String url, String token, Object body) throws Exception {
        return mockMvc.perform(post(url)
                .header(HttpHeaders.AUTHORIZATION, bearer(token))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)));
    }

    private ResultActions putAuthorized(String url, String token, Object body) throws Exception {
        return mockMvc.perform(put(url)
                .header(HttpHeaders.AUTHORIZATION, bearer(token))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)));
    }

    private ResultActions patchAuthorized(String url, String token, Object body) throws Exception {
        return mockMvc.perform(patch(url)
                .header(HttpHeaders.AUTHORIZATION, bearer(token))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)));
    }

    private ResultActions postJson(String url, Object body) throws Exception {
        return mockMvc.perform(post(url)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)));
    }

    private ResultActions putJsonWithCartToken(String url, String cartToken, Object body) throws Exception {
        return mockMvc.perform(put(url)
                .header("X-Cart-Token", cartToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)));
    }

    private ResultActions deleteWithCartToken(String url, String cartToken) throws Exception {
        return mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete(url)
                .header("X-Cart-Token", cartToken));
    }

    private JsonNode json(ResultActions resultActions) throws Exception {
        MvcResult result = resultActions.andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString());
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }
}
