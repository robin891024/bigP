package backend.otp.controller;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;

import backend.otp.entity.Member;
import backend.otp.service.MemberService;
import backend.otp.utils.JWTutils;
import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/oauth2")
public class OAuthController {

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String clientId;

    @Autowired
    private MemberService memberService;

    @Autowired
    private JWTutils jwtUtils;

    @PostMapping("/google")
    public ResponseEntity<Map<String, Object>> googleLogin(
            @RequestBody Map<String, String> request,
            HttpServletResponse response) {

        String token = request.get("credential");  // ← 改成 "credential"
        Map<String, Object> result = new HashMap<>();

        try {
            // 驗證 Google JWT token
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(),
                    GsonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(clientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(token);

            if (idToken != null) {
                GoogleIdToken.Payload payload = idToken.getPayload();

                String email = payload.getEmail();
                String name = (String) payload.get("name");
                String googleId = payload.getSubject();

                // 檢查會員是否存在
                Member member = memberService.findByAccount(email);

                if (member == null) {
                    // 建立新會員 - 使用特殊方法避免密碼加密
                    // member = new Member();
                    // member.setAccount(email);
                    // member.setName(name);
                    // member.setPassword("GOOGLE_OAUTH_" + googleId);
                    // memberService.registerOAuth(member);  // ← 使用新方法

                    String registerToken = jwtUtils.generateRegisterToken(email, name);

                    result.put("success", false);
                    result.put("needRegister", true);
                    result.put("registerToken", registerToken);
                    return ResponseEntity.ok(result);
                }

                

                // 產生 JWT token
                Integer role = memberService.findRoleByAccount(email);

                String jwtToken = jwtUtils.generateToken(email, role);

                ResponseCookie cookie = ResponseCookie.from("jwt", jwtToken)
                        .httpOnly(true)
                        .secure(false)
                        .path("/")
                        .maxAge(60 * 60)
                        .sameSite("Lax")
                        .build();

                response.addHeader("Set-Cookie", cookie.toString());

                result.put("success", true);
                result.put("message", "Google 登入成功");
                String rolelevel = switch (role) {
                    case 0 ->
                        "developer";
                    case 1 ->
                        "admin";
                    case 2 ->
                        "user";
                    default ->
                        "error";
                };
                result.put("role", rolelevel);
                result.put("user", Map.of("email", email, "name", name));
            } else {
                result.put("success", false);
                result.put("message", "無效的 Google token");
            }

        } catch (Exception e) {
            e.printStackTrace();
            result.put("success", false);
            result.put("message", "Google 登入失敗: " + e.getMessage());
        }

        return ResponseEntity.ok(result);
    }

    @PostMapping("/google/register-data")
    public ResponseEntity<Map<String, Object>> getGoogleRegisterData (@RequestBody Map<String, String> request) {
        
        String token = request.get("token");
        Map<String, Object> res = new HashMap<>();

        try {
            var claims = jwtUtils.parseRegisterToken(token);

            res.put("success", true);
            res.put("email", claims.get("email"));
            res.put("name", claims.get("name"));

            return ResponseEntity.ok(res);

        } catch (Exception e) {
            res.put("success", false);
            res.put("message", "Token expired or invalid");
            return ResponseEntity.ok(res);
        }
    }

    @PostMapping("/google/register")
    public ResponseEntity<Map<String, Object>> googleRegister(
            @RequestBody Map<String, String> request,
            HttpServletResponse response) {

        Map<String, Object> res = new HashMap<>();

        try {
            String token = request.get("token");
            String city = request.get("city");

            // 解析 registerToken（安全）
            var claims = jwtUtils.parseRegisterToken(token);

            String email = (String) claims.get("email");
            String name = (String) claims.get("name");

            // 建立會員
            Member member = new Member();
            member.setAccount(email);
            member.setName(name);
            member.setCity(city);
            member.setPassword(request.get("password"));
            member.setTel(request.get("tel"));

            memberService.register(member);

            // 註冊後立即登入
            Integer role = memberService.findRoleByAccount(email);
            String jwtToken = jwtUtils.generateToken(email, role);

            ResponseCookie cookie = ResponseCookie.from("jwt", jwtToken)
                    .httpOnly(true)
                    .secure(false)
                    .path("/")
                    .sameSite("Lax")
                    .maxAge(60 * 60)
                    .build();

            response.addHeader("Set-Cookie", cookie.toString());

            res.put("success", true);
            res.put("message", "Register + login success");
            res.put("user", Map.of("email", email, "name", name));

            return ResponseEntity.ok(res);

        } catch (Exception e) {
            res.put("success", false);
            res.put("message", e.getMessage());
            return ResponseEntity.ok(res);
        }
    }
    
}
