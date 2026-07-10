package com.restrobuild.security;

import com.restrobuild.auth.entity.Owner;
import com.restrobuild.auth.entity.UserRole;
import com.restrobuild.auth.repository.OwnerRepository;
import com.restrobuild.exception.ResourceNotFoundException;
import com.restrobuild.restaurant.entity.Restaurant;
import com.restrobuild.staff.entity.Staff;
import com.restrobuild.staff.repository.StaffRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class AuthenticatedUserServiceTest {

    private final OwnerRepository ownerRepository = mock(OwnerRepository.class);
    private final StaffRepository staffRepository = mock(StaffRepository.class);
    private final AuthenticatedUserService service = new AuthenticatedUserService(ownerRepository, staffRepository);

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void getAuthenticatedOwnerRequiresAuthentication() {
        assertThrows(AuthenticationCredentialsNotFoundException.class, service::getAuthenticatedOwner);
    }

    @Test
    void getAuthenticatedOwnerDeniesNonOwnerPrincipal() {
        authenticate("staff@test.local");
        when(ownerRepository.findByEmailIgnoreCase("staff@test.local")).thenReturn(Optional.empty());

        assertThrows(AccessDeniedException.class, service::getAuthenticatedOwner);
    }

    @Test
    void getAuthenticatedOwnerReturnsOwnerPrincipal() {
        Owner owner = new Owner("Owner", "owner@test.local", "hash");
        authenticate("owner@test.local");
        when(ownerRepository.findByEmailIgnoreCase("owner@test.local")).thenReturn(Optional.of(owner));

        assertSame(owner, service.getAuthenticatedOwner());
    }

    @Test
    void getAuthenticatedOwnerRestaurantUsesStaffRestaurant() {
        Restaurant restaurant = new Restaurant(
                "Test Restaurant",
                "Description",
                "Address",
                "1234567890",
                "restaurant@test.local",
                "9 AM - 9 PM",
                null,
                null,
                "test-restaurant"
        );
        Staff staff = new Staff(restaurant, "Kitchen", "kitchen@test.local", "hash", UserRole.ROLE_KITCHEN);
        authenticate("kitchen@test.local");
        when(ownerRepository.findByEmailIgnoreCase("kitchen@test.local")).thenReturn(Optional.empty());
        when(staffRepository.findByEmailIgnoreCase("kitchen@test.local")).thenReturn(Optional.of(staff));

        assertSame(restaurant, service.getAuthenticatedOwnerRestaurant());
    }

    @Test
    void getAuthenticatedOwnerRestaurantFailsWhenNoRestaurantExists() {
        Owner owner = new Owner("Owner", "owner@test.local", "hash");
        authenticate("owner@test.local");
        when(ownerRepository.findByEmailIgnoreCase("owner@test.local")).thenReturn(Optional.of(owner));

        assertThrows(ResourceNotFoundException.class, service::getAuthenticatedOwnerRestaurant);
    }

    private void authenticate(String email) {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(email, null, List.of())
        );
    }
}
