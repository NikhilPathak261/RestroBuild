package com.restrobuild.security;

import com.restrobuild.auth.entity.Owner;
import com.restrobuild.auth.repository.OwnerRepository;
import com.restrobuild.exception.ResourceNotFoundException;
import com.restrobuild.restaurant.entity.Restaurant;
import com.restrobuild.staff.repository.StaffRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class AuthenticatedUserService {

    private final OwnerRepository ownerRepository;
    private final StaffRepository staffRepository;

    public AuthenticatedUserService(OwnerRepository ownerRepository, StaffRepository staffRepository) {
        this.ownerRepository = ownerRepository;
        this.staffRepository = staffRepository;
    }

    public Owner getAuthenticatedOwner() {
        String email = getAuthenticationEmail();

        return ownerRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new AccessDeniedException("Authenticated owner required."));
    }

    public Restaurant getAuthenticatedOwnerRestaurant() {
        String email = getAuthenticationEmail();

        return ownerRepository.findByEmailIgnoreCase(email)
                .map(Owner::getRestaurant)
                .or(() -> staffRepository.findByEmailIgnoreCase(email).map(staff -> staff.getRestaurant()))
                .filter(restaurant -> restaurant != null)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant profile not found."));
    }

    private String getAuthenticationEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getName() == null
                || authentication.getName().isBlank()) {
            throw new AuthenticationCredentialsNotFoundException("Authentication required.");
        }

        return authentication.getName();
    }
}
