package backend.otp.filter;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import backend.otp.utils.JWTutils;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JWTutils jwtUtils;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        // 跳過公開端點，不進行 JWT 驗證
        String path = request.getRequestURI();
        if (path.equals("/member/login")
                || path.equals("/member/register")
                || path.equals("/member/checkAc")
                || path.equals("/member/verify")
                || path.startsWith("/oauth2/")
                || path.equals("/member/send-verification-code")
                || path.equals("/member/verify-email-code")
                || path.startsWith("/api/announcements") // 允許 /api/announcements 和 /api/announcements/**
                || path.startsWith("/api/events") // 允許 /api/events 和 /api/events/**
                || path.startsWith("/api/images") // 允許 /api/images 和 /api/images/**
                || path.startsWith("/api/log/session")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            // 從 Cookie 中取得 JWT token
            String jwt = getJwtFromCookie(request);

            // 如果沒有 token，返回 401
            if (jwt == null) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("{\"error\": \"未提供認證 token\"}");
                return;
            }

            // 驗證 token
            if (!jwtUtils.validateToken(jwt)) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("{\"error\": \"Token 無效或已過期\"}");
                return;
            }

            // 從 token 中取得使用者名稱
            String username = jwtUtils.getUsernameFromToken(jwt);
            Integer role = jwtUtils.getRoleFromToken(jwt); // ★ 從 JWT 取出 role

            // ★ 數字 role 轉成 Spring Security 需要的 Authority 字串
            String authority = switch (role) {
                case 0 ->
                    "ROLE_DEVELOPER";
                case 1 ->
                    "ROLE_ADMIN";
                case 2 ->
                    "ROLE_USER";
                default ->
                    "ROLE_GUEST";
            };

            // 建立認證物件
            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    username,
                    null,
                    List.of(new SimpleGrantedAuthority(authority)));

            authentication.setDetails(
                    new WebAuthenticationDetailsSource().buildDetails(request));

            // 將認證資訊設定到 SecurityContext
            SecurityContextHolder.getContext().setAuthentication(authentication);

            // 繼續執行過濾鏈
            filterChain.doFilter(request, response);

        } catch (Exception e) {
            logger.error("JWT 認證失敗: " + e.getMessage(), e);
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"error\": \"認證失敗\"}");
        }
    }

    /**
     * 從 Cookie 中取得 JWT token
     */
    private String getJwtFromCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();

        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("jwt".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }

        return null;
    }
}
