package com.example.openticket.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * 跨域資源共享 (CORS) 配置
 * 允許 React 開發伺服器 (http://localhost:5173) 存取後端 API
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**") // 假設您的所有 API 都是以 /api 開頭
                .allowedOrigins("http://localhost:5173") // 這是 React 開發伺服器的預設位址
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") 
                .allowedHeaders("*") 
                .allowCredentials(true) // 如果您使用 Cookies 或 Session
                .maxAge(3600); 
    }
}