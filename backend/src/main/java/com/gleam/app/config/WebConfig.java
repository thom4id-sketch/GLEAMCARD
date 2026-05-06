package com.gleam.app.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    // 画像はDBにBase64で保存するため、ローカルファイル配信は行わない
}
