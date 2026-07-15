package com.restrobuild.cart.repository;

import com.restrobuild.cart.entity.PublicCart;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PublicCartRepository extends JpaRepository<PublicCart, Long> {

    Optional<PublicCart> findByToken(String token);
}
