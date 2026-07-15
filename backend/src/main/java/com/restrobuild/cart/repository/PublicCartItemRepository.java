package com.restrobuild.cart.repository;

import com.restrobuild.cart.entity.PublicCartItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PublicCartItemRepository extends JpaRepository<PublicCartItem, Long> {

    Optional<PublicCartItem> findByIdAndCartToken(Long id, String cartToken);
}
