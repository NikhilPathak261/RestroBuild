package com.restrobuild.config;

import com.restrobuild.auth.entity.Owner;
import com.restrobuild.auth.entity.UserRole;
import com.restrobuild.auth.repository.OwnerRepository;
import com.restrobuild.category.entity.Category;
import com.restrobuild.category.repository.CategoryRepository;
import com.restrobuild.menu.entity.FoodType;
import com.restrobuild.menu.entity.MenuItem;
import com.restrobuild.menu.repository.MenuItemRepository;
import com.restrobuild.order.entity.CustomerOrder;
import com.restrobuild.order.entity.OrderItem;
import com.restrobuild.order.repository.CustomerOrderRepository;
import com.restrobuild.restaurant.entity.Restaurant;
import com.restrobuild.restaurant.repository.RestaurantRepository;
import com.restrobuild.review.entity.Review;
import com.restrobuild.review.repository.ReviewRepository;
import com.restrobuild.staff.entity.Staff;
import com.restrobuild.staff.repository.StaffRepository;
import com.restrobuild.table.entity.RestaurantTable;
import com.restrobuild.table.repository.RestaurantTableRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Component
@Profile("demo")
public class DemoDataInitializer implements CommandLineRunner {

    private static final String DEMO_OWNER_EMAIL = "owner@demo.restrobuild.test";
    private static final String DEMO_KITCHEN_EMAIL = "kitchen@demo.restrobuild.test";
    private static final String DEMO_WAITER_EMAIL = "waiter@demo.restrobuild.test";
    private static final String DEMO_PASSWORD = "DemoPass123";

    private final OwnerRepository ownerRepository;
    private final RestaurantRepository restaurantRepository;
    private final StaffRepository staffRepository;
    private final CategoryRepository categoryRepository;
    private final MenuItemRepository menuItemRepository;
    private final RestaurantTableRepository tableRepository;
    private final CustomerOrderRepository orderRepository;
    private final ReviewRepository reviewRepository;
    private final PasswordEncoder passwordEncoder;
    private final String frontendBaseUrl;

    public DemoDataInitializer(
            OwnerRepository ownerRepository,
            RestaurantRepository restaurantRepository,
            StaffRepository staffRepository,
            CategoryRepository categoryRepository,
            MenuItemRepository menuItemRepository,
            RestaurantTableRepository tableRepository,
            CustomerOrderRepository orderRepository,
            ReviewRepository reviewRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.frontend.base-url}") String frontendBaseUrl
    ) {
        this.ownerRepository = ownerRepository;
        this.restaurantRepository = restaurantRepository;
        this.staffRepository = staffRepository;
        this.categoryRepository = categoryRepository;
        this.menuItemRepository = menuItemRepository;
        this.tableRepository = tableRepository;
        this.orderRepository = orderRepository;
        this.reviewRepository = reviewRepository;
        this.passwordEncoder = passwordEncoder;
        this.frontendBaseUrl = frontendBaseUrl;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (ownerRepository.existsByEmailIgnoreCase(DEMO_OWNER_EMAIL)) {
            return;
        }

        String passwordHash = passwordEncoder.encode(DEMO_PASSWORD);
        Restaurant restaurant = createRestaurant();

        Owner owner = new Owner("Demo Owner", DEMO_OWNER_EMAIL, passwordHash);
        owner.assignRestaurant(restaurant);
        ownerRepository.save(owner);

        createStaffAccounts(restaurant, passwordHash);

        Category starters = categoryRepository.save(new Category(restaurant, "Starters", 1));
        Category mains = categoryRepository.save(new Category(restaurant, "Mains", 2));
        Category drinks = categoryRepository.save(new Category(restaurant, "Drinks", 3));

        List<MenuItem> menuItems = menuItemRepository.saveAll(List.of(
                new MenuItem(
                        restaurant,
                        starters,
                        "Paneer Tikka",
                        "Char-grilled paneer with peppers and house spice rub.",
                        BigDecimal.valueOf(280),
                        "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=900&q=80",
                        FoodType.VEG,
                        3,
                        1,
                        18,
                        true
                ),
                new MenuItem(
                        restaurant,
                        mains,
                        "Chicken Biryani",
                        "Aromatic basmati rice layered with tender chicken and saffron.",
                        BigDecimal.valueOf(360),
                        "https://images.unsplash.com/photo-1563379091339-03246963d51a?auto=format&fit=crop&w=900&q=80",
                        FoodType.NON_VEG,
                        3,
                        1,
                        25,
                        true
                ),
                new MenuItem(
                        restaurant,
                        mains,
                        "Dal Makhani",
                        "Slow-cooked black lentils finished with butter and cream.",
                        BigDecimal.valueOf(240),
                        "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=900&q=80",
                        FoodType.VEG,
                        2,
                        1,
                        20,
                        true
                ),
                new MenuItem(
                        restaurant,
                        drinks,
                        "Mango Lassi",
                        "Chilled yogurt drink blended with ripe mango.",
                        BigDecimal.valueOf(140),
                        "https://images.unsplash.com/photo-1626200419199-391ae4be7a41?auto=format&fit=crop&w=900&q=80",
                        FoodType.VEG,
                        0,
                        3,
                        5,
                        true
                )
        ));

        List<RestaurantTable> tables = createTables(restaurant);
        createOrdersAndReviews(restaurant, tables, menuItems);
    }

    private Restaurant createRestaurant() {
        Restaurant restaurant = new Restaurant(
                "Spice House Demo",
                "Modern Indian comfort food with fast QR ordering.",
                "42 Demo Street, Bengaluru",
                "+91 98765 43210",
                "hello@spicehouse.demo",
                "Mon-Sun 11:00 AM - 11:00 PM",
                "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=300&q=80",
                "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1400&q=80",
                "spice-house-demo"
        );
        restaurant.updateTheme("MODERN", "#B42318", "#FFF7ED");
        restaurant.updateAbout("Spice House Demo is seeded for live walkthroughs: scan a table QR, order from the menu, move it through kitchen and waiter workflows, and submit verified reviews.");
        restaurant.publish();
        return restaurantRepository.save(restaurant);
    }

    private void createStaffAccounts(Restaurant restaurant, String passwordHash) {
        staffRepository.save(new Staff(restaurant, "Demo Kitchen", DEMO_KITCHEN_EMAIL, passwordHash, UserRole.ROLE_KITCHEN));
        staffRepository.save(new Staff(restaurant, "Demo Waiter", DEMO_WAITER_EMAIL, passwordHash, UserRole.ROLE_WAITER));
    }

    private List<RestaurantTable> createTables(Restaurant restaurant) {
        List<RestaurantTable> tables = tableRepository.saveAll(List.of(
                new RestaurantTable(restaurant, 1),
                new RestaurantTable(restaurant, 2),
                new RestaurantTable(restaurant, 3),
                new RestaurantTable(restaurant, 4)
        ));

        tables.forEach((table) -> table.updateQrCodeUrl(frontendBaseUrl + "/r/" + restaurant.getSlug() + "?tableId=" + table.getId()));
        return tableRepository.saveAll(tables);
    }

    private void createOrdersAndReviews(Restaurant restaurant, List<RestaurantTable> tables, List<MenuItem> menuItems) {
        CustomerOrder pending = new CustomerOrder(restaurant, tables.get(0), "Less spicy.");
        pending.addItem(new OrderItem(menuItems.get(0), 1));
        pending.addItem(new OrderItem(menuItems.get(3), 2));
        orderRepository.save(pending);

        CustomerOrder preparing = new CustomerOrder(restaurant, tables.get(1), "Serve together.");
        preparing.addItem(new OrderItem(menuItems.get(1), 1));
        preparing.markPreparing();
        orderRepository.save(preparing);

        CustomerOrder ready = new CustomerOrder(restaurant, tables.get(2), null);
        ready.addItem(new OrderItem(menuItems.get(2), 2));
        ready.markPreparing();
        ready.markReady();
        orderRepository.save(ready);

        CustomerOrder served = new CustomerOrder(restaurant, tables.get(3), "Extra chutney.");
        served.addItem(new OrderItem(menuItems.get(0), 2));
        served.addItem(new OrderItem(menuItems.get(3), 1));
        served.markPreparing();
        served.markReady();
        served.markServed();
        CustomerOrder savedServed = orderRepository.save(served);

        reviewRepository.save(new Review(
                restaurant,
                menuItems.get(0),
                savedServed.getItems().get(0),
                5,
                "Perfectly smoky and great for sharing."
        ));
    }
}
