package com.restrobuild.security;

import com.restrobuild.auth.entity.Owner;
import com.restrobuild.auth.repository.OwnerRepository;
import com.restrobuild.exception.ResourceNotFoundException;
import com.restrobuild.restaurant.entity.Restaurant;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class AuthenticatedUserService {

    private final OwnerRepository ownerRepository;

    public AuthenticatedUserService(OwnerRepository ownerRepository) {
        this.ownerRepository = ownerRepository;
    }

    public Owner getAuthenticatedOwner() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        return ownerRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalStateException("Authenticated owner not found."));
    }

    public Restaurant getAuthenticatedOwnerRestaurant() {
        Owner owner = getAuthenticatedOwner();
        if (owner.getRestaurant() == null) {
            throw new ResourceNotFoundException("Restaurant profile not found.");
        }

        return owner.getRestaurant();
    }
}
