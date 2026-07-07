package com.restrobuild.staff.mapper;

import com.restrobuild.staff.dto.StaffResponse;
import com.restrobuild.staff.entity.Staff;
import org.springframework.stereotype.Component;

@Component
public class StaffMapper {

    public StaffResponse toResponse(Staff staff) {
        return new StaffResponse(
                staff.getId(),
                staff.getName(),
                staff.getEmail(),
                staff.getRole().name().replace("ROLE_", ""),
                staff.isActive()
        );
    }
}
