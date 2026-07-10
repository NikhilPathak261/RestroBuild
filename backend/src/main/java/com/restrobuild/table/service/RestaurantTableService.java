package com.restrobuild.table.service;

import com.restrobuild.exception.BusinessException;
import com.restrobuild.exception.ResourceNotFoundException;
import com.restrobuild.restaurant.entity.Restaurant;
import com.restrobuild.security.AuthenticatedUserService;
import com.restrobuild.table.dto.CreateTablesRequest;
import com.restrobuild.table.dto.QrValidationResponse;
import com.restrobuild.table.dto.TableResponse;
import com.restrobuild.table.dto.UpdateTableRequest;
import com.restrobuild.table.entity.RestaurantTable;
import com.restrobuild.table.mapper.TableMapper;
import com.restrobuild.table.repository.RestaurantTableRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Service
public class RestaurantTableService {

    private final RestaurantTableRepository tableRepository;
    private final AuthenticatedUserService authenticatedUserService;
    private final TableMapper tableMapper;
    private final String frontendBaseUrl;

    public RestaurantTableService(
            RestaurantTableRepository tableRepository,
            AuthenticatedUserService authenticatedUserService,
            TableMapper tableMapper,
            @Value("${app.frontend.base-url}") String frontendBaseUrl
    ) {
        this.tableRepository = tableRepository;
        this.authenticatedUserService = authenticatedUserService;
        this.tableMapper = tableMapper;
        this.frontendBaseUrl = frontendBaseUrl;
    }

    @Transactional
    public List<TableResponse> createTables(CreateTablesRequest request) {
        Restaurant restaurant = authenticatedUserService.getAuthenticatedOwnerRestaurant();
        List<RestaurantTable> existingTables = tableRepository
                .findByRestaurantIdAndActiveTrueOrderByTableNumberAsc(restaurant.getId());

        int nextTableNumber = existingTables.stream()
                .mapToInt(RestaurantTable::getTableNumber)
                .max()
                .orElse(0) + 1;

        List<RestaurantTable> createdTables = new ArrayList<>();
        for (int index = 0; index < request.numberOfTables(); index++) {
            RestaurantTable table = new RestaurantTable(restaurant, nextTableNumber + index);
            createdTables.add(tableRepository.save(table));
        }

        createdTables.forEach(this::assignQrUrl);

        return createdTables.stream()
                .map(tableMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TableResponse> getTables() {
        Restaurant restaurant = authenticatedUserService.getAuthenticatedOwnerRestaurant();
        return tableRepository.findByRestaurantIdAndActiveTrueOrderByTableNumberAsc(restaurant.getId())
                .stream()
                .map(tableMapper::toResponse)
                .toList();
    }

    @Transactional
    public TableResponse updateTable(Long tableId, UpdateTableRequest request) {
        Restaurant restaurant = authenticatedUserService.getAuthenticatedOwnerRestaurant();
        RestaurantTable table = getOwnerTable(tableId, restaurant.getId());

        if (tableRepository.existsByRestaurantIdAndTableNumberAndIdNotAndActiveTrue(
                restaurant.getId(),
                request.tableNumber(),
                tableId
        )) {
            throw new BusinessException("Table number already exists.");
        }

        table.updateTableNumber(request.tableNumber());
        assignQrUrl(table);
        return tableMapper.toResponse(table);
    }

    @Transactional
    public void deleteTable(Long tableId) {
        Restaurant restaurant = authenticatedUserService.getAuthenticatedOwnerRestaurant();
        RestaurantTable table = getOwnerTable(tableId, restaurant.getId());
        tableRepository.delete(table);
    }

    @Transactional
    public List<TableResponse> generateQrCodes() {
        Restaurant restaurant = authenticatedUserService.getAuthenticatedOwnerRestaurant();
        List<RestaurantTable> tables = tableRepository.findByRestaurantIdAndActiveTrueOrderByTableNumberAsc(restaurant.getId());
        tables.forEach(this::assignQrUrl);

        return tables.stream()
                .map(tableMapper::toResponse)
                .toList();
    }

    @Transactional
    public TableResponse regenerateQr(Long tableId) {
        Restaurant restaurant = authenticatedUserService.getAuthenticatedOwnerRestaurant();
        RestaurantTable table = getOwnerTable(tableId, restaurant.getId());
        assignQrUrl(table);
        return tableMapper.toResponse(table);
    }

    @Transactional(readOnly = true)
    public String getQrImageUrl(Long tableId, int size) {
        Restaurant restaurant = authenticatedUserService.getAuthenticatedOwnerRestaurant();
        RestaurantTable table = getOwnerTable(tableId, restaurant.getId());
        String qrTargetUrl = table.getQrCodeUrl() == null
                ? frontendBaseUrl + "/r/" + table.getRestaurant().getSlug() + "?tableId=" + table.getId()
                : table.getQrCodeUrl();
        String encodedData = URLEncoder.encode(qrTargetUrl, StandardCharsets.UTF_8);
        return "https://api.qrserver.com/v1/create-qr-code/?size=" + size + "x" + size + "&data=" + encodedData;
    }

    @Transactional(readOnly = true)
    public QrValidationResponse validateQr(Long tableId) {
        RestaurantTable table = tableRepository.findByIdAndActiveTrue(tableId)
                .orElseThrow(() -> new ResourceNotFoundException("QR code not found."));

        if (!table.getRestaurant().isActive() || !table.getRestaurant().isPublished()) {
            throw new ResourceNotFoundException("Restaurant website not found.");
        }

        return tableMapper.toQrValidationResponse(table);
    }

    private RestaurantTable getOwnerTable(Long tableId, Long restaurantId) {
        return tableRepository.findByIdAndRestaurantIdAndActiveTrue(tableId, restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Table not found."));
    }

    private void assignQrUrl(RestaurantTable table) {
        table.updateQrCodeUrl(frontendBaseUrl + "/r/" + table.getRestaurant().getSlug() + "?tableId=" + table.getId());
    }
}
