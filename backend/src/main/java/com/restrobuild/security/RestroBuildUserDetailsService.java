package com.restrobuild.security;

import com.restrobuild.auth.entity.Owner;
import com.restrobuild.auth.repository.OwnerRepository;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class RestroBuildUserDetailsService implements UserDetailsService {

    private final OwnerRepository ownerRepository;

    public RestroBuildUserDetailsService(OwnerRepository ownerRepository) {
        this.ownerRepository = ownerRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) {
        Owner owner = ownerRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found."));

        return User.withUsername(owner.getEmail())
                .password(owner.getPasswordHash())
                .authorities(owner.getRole().name())
                .disabled(!owner.isActive())
                .build();
    }
}
