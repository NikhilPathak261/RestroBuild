package com.restrobuild.website.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateWebsiteThemeRequest(
        @NotBlank(message = "Template is required.")
        @Size(max = 50, message = "Template must be at most 50 characters.")
        String template,

        @NotBlank(message = "Primary color is required.")
        @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Primary color must be a hex color.")
        String primaryColor,

        @NotBlank(message = "Secondary color is required.")
        @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Secondary color must be a hex color.")
        String secondaryColor
) {
}
