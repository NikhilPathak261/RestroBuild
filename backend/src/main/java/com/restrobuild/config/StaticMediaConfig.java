package com.restrobuild.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;

@Configuration
public class StaticMediaConfig implements WebMvcConfigurer {

    private final String mediaLocation;

    public StaticMediaConfig(@Value("${app.upload.media-dir:uploads/media}") String mediaDirectory) {
        String directoryUri = Path.of(mediaDirectory).toAbsolutePath().normalize().toUri().toString();
        this.mediaLocation = directoryUri.endsWith("/") ? directoryUri : directoryUri + "/";
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/media/**")
                .addResourceLocations(mediaLocation);
    }
}
