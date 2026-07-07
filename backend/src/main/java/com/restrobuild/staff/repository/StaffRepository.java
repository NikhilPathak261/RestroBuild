package com.restrobuild.staff.repository;

import com.restrobuild.staff.entity.Staff;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StaffRepository extends JpaRepository<Staff, Long> {

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCaseAndIdNot(String email, Long id);

    Optional<Staff> findByEmailIgnoreCase(String email);

    List<Staff> findByRestaurantIdOrderByNameAsc(Long restaurantId);

    Optional<Staff> findByIdAndRestaurantId(Long id, Long restaurantId);
}
