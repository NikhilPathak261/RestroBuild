package com.restrobuild.upload.service;

import com.restrobuild.exception.BusinessException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
public class MediaStorageService {

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png", "webp", "gif");

    private final Path mediaDirectory;

    public MediaStorageService(@Value("${app.upload.media-dir:uploads/media}") String mediaDirectory) {
        this.mediaDirectory = Path.of(mediaDirectory).toAbsolutePath().normalize();
    }

    public String store(MultipartFile file) {
        validate(file);

        String extension = getExtension(file.getOriginalFilename());
        String storedFileName = UUID.randomUUID() + "." + extension;
        Path targetPath = mediaDirectory.resolve(storedFileName).normalize();

        try {
            Files.createDirectories(mediaDirectory);
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetPath, StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (IOException error) {
            throw new BusinessException("Failed to store uploaded media.");
        }

        return ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/uploads/media/")
                .path(storedFileName)
                .toUriString();
    }

    private void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("Upload file is required.");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new BusinessException("Only image uploads are supported.");
        }

        String extension = getExtension(file.getOriginalFilename());
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new BusinessException("Supported image formats are jpg, png, webp, and gif.");
        }
    }

    private String getExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            throw new BusinessException("Uploaded image must include a file extension.");
        }

        return fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT);
    }
}
