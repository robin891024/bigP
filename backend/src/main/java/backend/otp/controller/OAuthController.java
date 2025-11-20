package backend.otp.controller;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
                    member = new Member();
                    member.setAccount(email);
                    member.setName(name);
                    member.setPassword("GOOGLE_OAUTH_" + googleId);
                    memberService.registerOAuth(member);  // ← 使用新方法
                }

                // 產生 JWT token
                String jwtToken = jwtUtils.generateToken(email);
                
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
}
