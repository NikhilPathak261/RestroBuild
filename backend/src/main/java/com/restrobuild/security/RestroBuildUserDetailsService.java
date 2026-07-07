package com.restrobuild.security;

import com.restrobuild.auth.entity.Owner;
import com.restrobuild.auth.repository.OwnerRepository;
import com.restrobuild.staff.entity.Staff;
import com.restrobuild.staff.repository.StaffRepository;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class RestroBuildUserDetailsService implements UserDetailsService {

    private final OwnerRepository ownerRepository;
    private final StaffRepository staffRepository;

    public RestroBuildUserDetailsService(OwnerRepository ownerRepository, StaffRepository staffRepository) {
        this.ownerRepository = ownerRepository;
        this.staffRepository = staffRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) {
        return ownerRepository.findByEmailIgnoreCase(email)
                .<UserDetails>map(owner -> User.withUsername(owner.getEmail())
                        .password(owner.getPasswordHash())
                        .authorities(owner.getRole().name())
                        .disabled(!owner.isActive())
                        .build())
                .or(() -> staffRepository.findByEmailIgnoreCase(email).map(staff -> buildStaffUser(staff)))
                .orElseThrow(() -> new UsernameNotFoundException("User not found."));
    }

    private UserDetails buildStaffUser(Staff staff) {
        return User.withUsername(staff.getEmail())
                .password(staff.getPasswordHash())
                .authorities(staff.getRole().name())
                .disabled(!staff.isActive())
                .build();
    }
}
