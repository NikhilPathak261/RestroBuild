package com.restrobuild.table.mapper;

import com.restrobuild.table.dto.QrValidationResponse;
import com.restrobuild.table.dto.TableResponse;
import com.restrobuild.table.entity.RestaurantTable;
import org.springframework.stereotype.Component;

@Component
public class TableMapper {

    public TableResponse toResponse(RestaurantTable table) {
        return new TableResponse(
                table.getId(),
                table.getTableNumber(),
                table.getQrCodeUrl(),
                table.isActive()
        );
    }

    public QrValidationResponse toQrValidationResponse(RestaurantTable table) {
        return new QrValidationResponse(
                table.getRestaurant().getId(),
                table.getRestaurant().getName(),
                table.getRestaurant().getSlug(),
                table.getId(),
                table.getTableNumber()
        );
    }
}
