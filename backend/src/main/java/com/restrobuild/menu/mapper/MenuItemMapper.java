package com.restrobuild.menu.mapper;

import com.restrobuild.menu.dto.MenuItemResponse;
import com.restrobuild.menu.entity.MenuItem;
import org.springframework.stereotype.Component;

@Component
public class MenuItemMapper {

    public MenuItemResponse toResponse(MenuItem menuItem) {
        return new MenuItemResponse(
                menuItem.getId(),
                menuItem.getCategory().getId(),
                menuItem.getCategory().getName(),
                menuItem.getName(),
                menuItem.getDescription(),
                menuItem.getPrice(),
                menuItem.getImageUrl(),
                menuItem.getFoodType(),
                menuItem.getSpicyLevel(),
                menuItem.getSweetLevel(),
                menuItem.getPreparationTime(),
                menuItem.isAvailable(),
                menuItem.isHidden()
        );
    }
}
