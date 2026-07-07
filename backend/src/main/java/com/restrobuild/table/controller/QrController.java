package com.restrobuild.table.controller;

import com.restrobuild.common.ApiResponse;
import com.restrobuild.table.dto.QrValidationResponse;
import com.restrobuild.table.dto.TableResponse;
import com.restrobuild.table.service.RestaurantTableService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class QrController {

    private final RestaurantTableService tableService;

    public QrController(RestaurantTableService tableService) {
        this.tableService = tableService;
    }

    @PostMapping("/api/qr/generate")
    @PreAuthorize("hasAuthority('ROLE_OWNER')")
    public ResponseEntity<ApiResponse<List<TableResponse>>> generateQrCodes() {
        List<TableResponse> response = tableService.generateQrCodes();
        return ResponseEntity.ok(ApiResponse.success("QR codes generated successfully.", response));
    }

    @PostMapping("/api/qr/regenerate/{tableId}")
    @PreAuthorize("hasAuthority('ROLE_OWNER')")
    public ResponseEntity<ApiResponse<TableResponse>> regenerateQr(@PathVariable Long tableId) {
        TableResponse response = tableService.regenerateQr(tableId);
        return ResponseEntity.ok(ApiResponse.success("QR code regenerated successfully.", response));
    }

    @GetMapping("/api/public/qr/{tableId}")
    public ResponseEntity<ApiResponse<QrValidationResponse>> validateQr(@PathVariable Long tableId) {
        QrValidationResponse response = tableService.validateQr(tableId);
        return ResponseEntity.ok(ApiResponse.success("QR code validated successfully.", response));
    }
}
