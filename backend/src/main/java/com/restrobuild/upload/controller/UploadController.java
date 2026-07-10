package com.restrobuild.upload.controller;

import com.restrobuild.common.ApiResponse;
import com.restrobuild.upload.dto.UploadResponse;
import com.restrobuild.upload.service.MediaStorageService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/uploads")
@PreAuthorize("hasAuthority('ROLE_OWNER')")
public class UploadController {

    private final MediaStorageService mediaStorageService;

    public UploadController(MediaStorageService mediaStorageService) {
        this.mediaStorageService = mediaStorageService;
    }

    @PostMapping(value = "/media", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<UploadResponse>> uploadMedia(@RequestPart("file") MultipartFile file) {
        UploadResponse response = new UploadResponse(mediaStorageService.store(file));
        return ResponseEntity.ok(ApiResponse.success("Media uploaded successfully.", response));
    }
}
