package backend.otp.filter;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
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
        if (path.equals("/member/login") ||
            path.equals("/member/register") ||
            path.equals("/member/checkAc") ||
            path.equals("/member/verify") ||
            path.startsWith("/oauth2/")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            // 從 Cookie 中取得 JWT token
            String jwt = getJwtFromCookie(request);

            // 如果有 token 且驗證通過
            if (jwt != null && jwtUtils.validateToken(jwt)) {
                // 從 token 中取得使用者名稱
                String username = jwtUtils.getUsernameFromToken(jwt);

                // 建立認證物件
                UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                        username,
                        null,
                        null  // 這裡可以加入權限，目前先設為 null
                    );

                authentication.setDetails(
                    new WebAuthenticationDetailsSource().buildDetails(request)
                );

                // 將認證資訊設定到 SecurityContext
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception e) {
            logger.error("無法設定使用者認證: {}", e);
        }

        // 繼續執行過濾鏈
        filterChain.doFilter(request, response);
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