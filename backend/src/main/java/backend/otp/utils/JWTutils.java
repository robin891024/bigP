package backend.otp.utils;

import java.security.Key;
import java.util.Date;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;

@Component
public class JWTutils {

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.expiration}")
    private long expirationTime;

    public Key getSigningKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes());
    }

    public String generateToken(String username, Integer role) {
        return Jwts.builder()
                .setSubject(username)
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationTime))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (JwtException e) {
            return false;
        }
    }

    public String getUsernameFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();

        return claims.getSubject();
    }

    public Integer getRoleFromToken(String token) {
        Claims claim = Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claim.get("role", Integer.class);
    }

    public String generateRegisterToken(String email, String name) {
        return Jwts.builder()
                .claim("email", email)
                .claim("name", name)
                .setExpiration(new Date(System.currentTimeMillis() + 3 * 60 * 1000)) // 3 分鐘
                .signWith(getSigningKey())
                .compact();
    }

    public Claims parseRegisterToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

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

    public boolean JWTtokenValid(HttpServletRequest request) {

        String jwtToken = getJwtFromCookie(request);

        return jwtToken != null && validateToken(jwtToken);

    }

    /**
     * 生成信箱驗證 Token (包含加密的驗證碼)
     *
     * @param email 用戶信箱
     * @param verificationCodeHash 驗證碼的 BCrypt hash
     * @return JWT Token (5分鐘有效)
     */
    public String generateEmailVerificationToken(String email, String verificationCodeHash) {
        return Jwts.builder()
                .claim("email", email)
                .claim("codeHash", verificationCodeHash)
                .claim("type", "email_verification")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 5 * 60 * 1000)) // 5分鐘
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * 驗證信箱驗證 Token 和驗證碼
     *
     * @param token JWT Token
     * @param inputCode 用戶輸入的驗證碼
     * @return 驗證成功返回 email,失敗返回 null
     */
    public String validateEmailVerificationToken(String token, String inputCode) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            // 檢查 Token 類型
            if (!"email_verification".equals(claims.get("type"))) {
                return null;
            }

            // 驗證驗證碼
            String storedHash = claims.get("codeHash", String.class);
            if (!BCrypt.checkpw(inputCode, storedHash)) {
                return null;
            }

            return claims.get("email", String.class);
        } catch (JwtException e) {
            return null;
        }
    }

    /**
     * 生成註冊 Token (驗證信箱後才能註冊)
     *
     * @param email 已驗證的信箱
     * @return JWT Token (10分鐘有效)
     */
    public String generateRegistrationToken(String email) {
        return Jwts.builder()
                .claim("email", email)
                .claim("type", "registration")
                .claim("verified", true)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 10 * 60 * 1000)) // 10分鐘
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * 驗證註冊 Token
     *
     * @param token JWT Token
     * @return 驗證成功返回 email,失敗返回 null
     */
    public String validateRegistrationToken(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            // 檢查 Token 類型和驗證狀態
            if (!"registration".equals(claims.get("type"))
                    || !Boolean.TRUE.equals(claims.get("verified"))) {
                return null;
            }

            return claims.get("email", String.class);
        } catch (JwtException e) {
            return null;
        }
    }
}
