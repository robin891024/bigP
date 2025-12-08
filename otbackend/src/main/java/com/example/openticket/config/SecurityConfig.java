package com.example.openticket.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // 禁用 CSRF (對 REST API 來說通常是必要的)
            .csrf(csrf -> csrf.disable()) 
            //下面兩行暫時解決403問題
            .httpBasic(AbstractHttpConfigurer::disable)
            .formLogin(AbstractHttpConfigurer::disable)
            // 設置授權規則
            .authorizeHttpRequests(auth -> auth

                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/reservations").permitAll()
                // 允許對所有活動和票種相關 API 的公共存取
                .requestMatchers("/api/events/**", "/api/eventtickettype/**","/api/announcements/**","/api/log/session","/api/reservations","/api/reservations/create").permitAll()
                // 允許 CORS 預檢請求
                .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll() 
                // 其他所有請求都需要身份驗證
                .anyRequest().authenticated()


            );

        return http.build();
    }
}
