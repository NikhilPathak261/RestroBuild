package com.restrobuild.website.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateAboutRequest(
        @NotBlank(message = "About section is required.")
        @Size(max = 2000, message = "About section must be at most 2000 characters.")
        String about
) {
}
