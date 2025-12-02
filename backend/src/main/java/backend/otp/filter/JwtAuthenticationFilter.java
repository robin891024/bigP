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
        System.out.println("【DEBUG】 後端收到的請求 URI: " + path);
        if (path.startsWith("/api/events")             // 活動列表 (GET)
            || path.startsWith("/api/announcements") // 公告列表 (GET)
            || path.endsWith("log/session")          // Session Log (POST)
            || path.equals("/member/login")
            || path.equals("/member/register")
            || path.equals("/member/checkAc")
            || path.equals("/member/verify")
            || path.startsWith("/oauth2/")) {
        
            System.out.println("【DEBUG】 成功繞過 JWT 驗證 (公開端點): " + path); // 2. 成功繞過後才打印
            filterChain.doFilter(request, response);
            return; // 3. 執行後立即返回，不再執行 JWT 驗證！
        }
        try {
            // 從 Cookie 中取得 JWT token
            String jwt = getJwtFromCookie(request);

            // 如果有 token 且驗證通過
            if (jwt != null && jwtUtils.validateToken(jwt)) {
                // 從 token 中取得使用者名稱
                String username = jwtUtils.getUsernameFromToken(jwt);
                Integer role = jwtUtils.getRoleFromToken(jwt);  // ★ 從 JWT 取出 role

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
                UsernamePasswordAuthenticationToken authentication
                        = new UsernamePasswordAuthenticationToken(
                                username,
                                null,
                                List.of(new SimpleGrantedAuthority(authority)) // 這裡可以加入權限，目前先設為 null
                        );

                authentication.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );

                // 將認證資訊設定到 SecurityContext
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception e) {
            logger.error("無法設定使用者認證: " + e.getMessage(), e);
        }
        System.out.println("【DEBUG】 成功繞過 JWT 驗證: " + path);
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
