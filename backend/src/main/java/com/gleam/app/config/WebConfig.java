package com.gleam.app.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // アップロード画像を /uploads/** で配信
        registry.addResourceHandler("/uploads/**")
            .addResourceLocations("file:uploads/");
    }
}
