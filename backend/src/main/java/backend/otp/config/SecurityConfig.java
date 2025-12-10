package backend.otp.config;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.access.hierarchicalroles.RoleHierarchy;
import org.springframework.security.access.hierarchicalroles.RoleHierarchyImpl;
import org.springframework.security.config.annotation.web.builders.HttpSecurity; // 確保有這個 import
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import backend.otp.filter.JwtAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder encoder () {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public RoleHierarchy roleHierarchy () {
        RoleHierarchyImpl hierarchy = new RoleHierarchyImpl();
        hierarchy.setHierarchy("""
            ROLE_DEVELOPER > ROLE_ADMIN
            ROLE_ADMIN > ROLE_USER
            ROLE_USER > ROLE_GUEST
        """);
        return hierarchy;
    }

    @Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
        // .cors(cors -> cors.configurationSource(corsConfigurationSource()))
        // .csrf(csrf -> csrf.disable())
        // .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

        // // 【修正點 1: 將 exceptionHandling 移到這裡】
        // .exceptionHandling(exception -> exception
        //     // 當用戶嘗試訪問需要認證但未提供有效認證時觸發
        //     .authenticationEntryPoint((request, response, authException) -> {
        //         response.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // 設置為 401
        //         response.setContentType("application/json");
        //         response.getWriter().write("{\"error\": \"認證失敗或 Token 無效\"}");
        //     })
        // )
        .csrf(csrf -> csrf.disable()) // 關閉 CSRF(因為使用 JWT)
        .cors(cors -> {
                })
        .sessionManagement(session
                -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // 無狀態

        // 【修正點 2: 只使用一個 authorizeHttpRequests 區塊】
        .authorizeHttpRequests(auth -> auth
            // 允許所有 OPTIONS（Preflight 必須放行）
            .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

            // 放行 Session Log API
            .requestMatchers("/api/log/session/**").permitAll()

            // 公開 API
            .requestMatchers(
                "/member/login",
                "/member/register",
                "/member/checkAc",
                "/member/verify",
                "/member/send-verification-code", // 新增
                "/member/verify-email-code", // 新增
                "/api/announcements",
                "/api/announcements/**",
                "/api/events/**",
                "/api/images/**",
                "/oauth2/**",
                "/oauth2/**",
                "/loginLog/add"
            ).permitAll()

            // 其他全部需要 JWT
            .anyRequest().authenticated()
        )
        // 確保 JWT 過濾器被添加
        .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

    return http.build();
}
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(List.of("http://localhost:5173"));
    configuration.setAllowedMethods(List.of("GET", "POST", "OPTIONS"));
    configuration.setAllowedHeaders(List.of("*"));
    configuration.setAllowCredentials(true);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}
}