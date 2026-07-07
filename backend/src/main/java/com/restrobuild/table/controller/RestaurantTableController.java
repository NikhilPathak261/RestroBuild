package com.restrobuild.table.controller;

import com.restrobuild.common.ApiResponse;
import com.restrobuild.table.dto.CreateTablesRequest;
import com.restrobuild.table.dto.TableResponse;
import com.restrobuild.table.dto.UpdateTableRequest;
import com.restrobuild.table.service.RestaurantTableService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class RestaurantTableController {

    private final RestaurantTableService tableService;

    public RestaurantTableController(RestaurantTableService tableService) {
        this.tableService = tableService;
    }

    @PostMapping("/api/tables")
    @PreAuthorize("hasAuthority('ROLE_OWNER')")
    public ResponseEntity<ApiResponse<List<TableResponse>>> createTables(
            @Valid @RequestBody CreateTablesRequest request
    ) {
        List<TableResponse> response = tableService.createTables(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tables created successfully.", response));
    }

    @GetMapping("/api/tables")
    @PreAuthorize("hasAuthority('ROLE_OWNER')")
    public ResponseEntity<ApiResponse<List<TableResponse>>> getTables() {
        List<TableResponse> response = tableService.getTables();
        return ResponseEntity.ok(ApiResponse.success("Tables fetched successfully.", response));
    }

    @PutMapping("/api/tables/{tableId}")
    @PreAuthorize("hasAuthority('ROLE_OWNER')")
    public ResponseEntity<ApiResponse<TableResponse>> updateTable(
            @PathVariable Long tableId,
            @Valid @RequestBody UpdateTableRequest request
    ) {
        TableResponse response = tableService.updateTable(tableId, request);
        return ResponseEntity.ok(ApiResponse.success("Table updated successfully.", response));
    }

    @DeleteMapping("/api/tables/{tableId}")
    @PreAuthorize("hasAuthority('ROLE_OWNER')")
    public ResponseEntity<ApiResponse<Void>> deleteTable(@PathVariable Long tableId) {
        tableService.deleteTable(tableId);
        return ResponseEntity.ok(ApiResponse.success("Table deleted successfully."));
    }
}
