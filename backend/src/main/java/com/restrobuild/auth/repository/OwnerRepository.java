package com.restrobuild.auth.repository;

import com.restrobuild.auth.entity.Owner;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OwnerRepository extends JpaRepository<Owner, Long> {

    boolean existsByEmailIgnoreCase(String email);

    Optional<Owner> findByEmailIgnoreCase(String email);
}
