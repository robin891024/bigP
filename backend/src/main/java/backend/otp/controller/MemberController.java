package backend.otp.controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import backend.otp.dto.MemberDto;
import backend.otp.dto.MemberReviseDto;
import backend.otp.entity.LoginLog;
import backend.otp.entity.Member;
import backend.otp.service.EmailService;
import backend.otp.service.LoginLogService;
import backend.otp.service.MemberService;
import backend.otp.service.VerificationService;
import backend.otp.utils.BCrypt;
import backend.otp.utils.JWTutils;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/member")
public class MemberController {

    @Autowired
    private NamedParameterJdbcTemplate jdbc;

    @Autowired
    private MemberService service;

    @Autowired
    private LoginLogService LoginLogservice;

    @Autowired
    private JWTutils jwt;

    @Autowired
    private EmailService emailService;
    @Autowired
    private VerificationService verificationService;
    // private final Map<String, Long> verificationCodeTimestamp = new ConcurrentHashMap<>();
    // private final Map<String, Integer> verificationAttempts = new ConcurrentHashMap<>();
    // private static final int MAX_ATTEMPTS = 5;

    @GetMapping("/findAll")
    public List<Map<String, Object>> list() {
        String sql = "SELECT * FROM member";
        return jdbc.queryForList(sql, new HashMap<>());
    }

    @GetMapping("/profile")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<MemberDto> getProfile() {

        String account = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        Member member = service.findByAccount(account);

        MemberDto dto = new MemberDto();

        dto.setId(member.getId());
        dto.setAccount(account);
        dto.setName(member.getName());
        dto.setRole(member.getRole());
        dto.setCity(member.getCity());
        dto.setTel(member.getTel());

        return ResponseEntity.ok(dto);
    }

    @GetMapping("/checkAc")
    public ResponseEntity<Boolean> checkAc(@RequestParam String account) {

        boolean isExist = service.checkAc(account);

        return ResponseEntity.ok(isExist);
    }

    /**
     * 修改後的註冊端點 (需要驗證 Token)
     */
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> registerWithVerification(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();

        // 1. 取得註冊 Token
        String registrationToken = (String) request.get("registrationToken");

        if (registrationToken == null || registrationToken.isEmpty()) {
            response.put("success", false);
            response.put("message", "請先驗證信箱");
            return ResponseEntity.badRequest().body(response);
        }

        // 2. 驗證註冊 Token
        String verifiedEmail = jwt.validateRegistrationToken(registrationToken);

        if (verifiedEmail == null) {
            response.put("success", false);
            response.put("message", "驗證已過期,請重新驗證信箱");
            return ResponseEntity.badRequest().body(response);
        }

        // 3. 檢查 Token 中的信箱與提交的信箱是否一致
        String submittedEmail = (String) request.get("account");
        if (!verifiedEmail.equals(submittedEmail)) {
            response.put("success", false);
            response.put("message", "信箱不一致,請重新驗證");
            return ResponseEntity.badRequest().body(response);
        }

        // 4. 再次檢查信箱是否已被註冊 (防止競態條件)
        if (service.checkAc(verifiedEmail)) {
            response.put("success", false);
            response.put("message", "此信箱已被註冊");
            return ResponseEntity.badRequest().body(response);
        }

        // 5. 建立 Member 物件
        Member member = new Member();
        member.setAccount(verifiedEmail);
        member.setPassword((String) request.get("password"));
        member.setName((String) request.get("name"));
        member.setCity((String) request.get("city"));
        member.setTel((String) request.get("tel"));

        // 6. 註冊用戶 (使用現有的 service.register 方法)
        boolean success = service.register(member);

        response.put("success", success);
        response.put("message", success ? "註冊成功" : "註冊失敗");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(
            @RequestParam String account,
            @RequestParam String password,
            HttpServletResponse response,
            HttpServletRequest request) {

        Map<String, Object> body = new HashMap<>();

        boolean success = service.login(account, password);

        if (success) {

            addLoginLog(account, LoginLog.Status.SUCCESS, request);

            Integer role = service.findRoleByAccount(account);

            String token = jwt.generateToken(account, role);

            ResponseCookie cookie = ResponseCookie.from("jwt", token)
                    .httpOnly(true) // 前端 JS 無法讀取
                    .secure(false) // 若部署 HTTPS，請改成 true
                    .path("/") // 整個網站都能用
                    .maxAge(60 * 60) // 一小時
                    .sameSite("Lax") // 防止 CSRF
                    .build();

            response.addHeader("Set-Cookie", cookie.toString());

            body.put("success", true);
            body.put("message", "登入成功");
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
            body.put("role", rolelevel);
            return ResponseEntity.ok(body);
        } else {

            addLoginLog(account, LoginLog.Status.FAIL, request);

            body.put("success", false);
            body.put("message", "帳號或密碼錯誤");
            return ResponseEntity.ok(body);
        }

    }

    @GetMapping("/verify")
    public ResponseEntity<Map<String, Object>> verity(@CookieValue(value = "jwt", required = false) String token) {
        Map<String, Object> body = new HashMap<>();

        if (token == null || token.isEmpty()) {
            body.put("authenticated", false);
            return ResponseEntity.ok(body);
        }

        try {
            if (jwt.validateToken(token)) {
                String account = jwt.getUsernameFromToken(token);
                body.put("authenticated", true);
                body.put("account", account);
                return ResponseEntity.ok(body);
            }
        } catch (Exception e) {
            System.err.println("JWT 驗證錯誤: " + e.getMessage());
        }
        body.put("authenticated", false);
        return ResponseEntity.ok(body);
    }

    @PostMapping("/logout")
    public ResponseEntity<Boolean> logout(HttpServletResponse response) {

        ResponseCookie cookie = ResponseCookie.from("jwt", "")
                .httpOnly(true) // 前端 JS 無法讀取
                .secure(false) // 若部署 HTTPS，請改成 true
                .path("/") // 整個網站都能用
                .maxAge(0) // 一小時
                .sameSite("Lax") // 防止 CSRF
                .build();

        response.addHeader("Set-Cookie", cookie.toString());

        return ResponseEntity.ok(true);
    }

    @PostMapping("/passwordVerify")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Map<String, Boolean>> passwordVerify(@RequestBody Map<String, String> req, HttpServletRequest request) {

        String jwtToken = getJwtFromCookie(request);
        Map<String, Boolean> map = new HashMap<>();

        if (jwtToken != null && jwt.validateToken(jwtToken)) {
            String account = jwt.getUsernameFromToken(jwtToken);

            map.put("success", BCrypt.checkpw(req.get("password"), service.findPassword(account)));
            return ResponseEntity.ok(map);
        } else {
            map.put("success", false);
            return ResponseEntity.ok(map);
        }

    }

    @PutMapping("/revise")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Map<String, Boolean>> revise(@RequestBody MemberReviseDto dto, HttpServletRequest request) {

        String jwtToken = getJwtFromCookie(request);
        Map<String, Boolean> map = new HashMap<>();

        if (jwtToken != null && jwt.validateToken(jwtToken)) {
            String account = jwt.getUsernameFromToken(jwtToken);

            Member member = service.findByAccount(account);
            if (member == null) {
                map.put("success", false);
                return ResponseEntity.ok(map);
            }

            if (dto.getName() != null) {
                member.setName(dto.getName());
            }
            if (dto.getCity() != null) {
                member.setCity(dto.getCity());
            }
            if (dto.getTel() != null) {
                member.setTel(dto.getTel());
            }
            if (dto.getPassword() != null && !dto.getPassword().isEmpty()) {
                member.setPassword(BCrypt.hashpw(dto.getPassword(), BCrypt.gensalt()));
            }

            map.put("success", service.revise(member));
        } else {
            map.put("success", false);
        }

        return ResponseEntity.ok(map);
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

    private boolean addLoginLog(String account, LoginLog.Status status, HttpServletRequest request) {

        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null) {
            ip = request.getRemoteAddr();
        }

        String userAgent = request.getHeader("User-Agent");

        LoginLog log = new LoginLog();

        Long id = service.findIdByAccount(account);

        log.setUserId(id);
        log.setUserAgent(userAgent);
        log.setIpAddress(ip);
        log.setStatus(status);
        log.setLoginTime(LocalDateTime.now());

        LoginLogservice.saveLoginLog(log);

        return true;
    }

    /**
     * 發送信箱驗證碼
     */
    @PostMapping("/send-verification-code")
    public ResponseEntity<Map<String, Object>> sendVerificationCode(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        Map<String, Object> response = new HashMap<>();
        
        // 1. 驗證信箱格式
        if (email == null || !email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")) {
            response.put("success", false);
            response.put("message", "信箱格式不正確");
            return ResponseEntity.badRequest().body(response);
        }
        
        // 2. 檢查信箱是否已註冊
        if (service.checkAc(email)) {
            response.put("success", false);
            response.put("message", "此信箱已被註冊");
            return ResponseEntity.badRequest().body(response);
        }
        
        // 3. 檢查發送頻率限制 (60秒內只能發送一次)
        if (!verificationService.canSendCode(email)) {
            long remainingSeconds = verificationService.getRemainingCooldown(email);
            response.put("success", false);
            response.put("message", "請等待 " + remainingSeconds + " 秒後再試");
            response.put("remainingSeconds", remainingSeconds);
            return ResponseEntity.badRequest().body(response);
        }
        
        try {
            // 4. 生成6位數驗證碼
            String verificationCode = String.format("%06d", new Random().nextInt(999999));
            
            // 5. 加密驗證碼 (只有加密後的 hash 會存入 Token)
            String codeHash = BCrypt.hashpw(verificationCode, BCrypt.gensalt());
            
            // 6. 生成 JWT Token (驗證碼的 hash 存在 Token 中)
            String token = jwt.generateEmailVerificationToken(email, codeHash);
            
            // 7. 記錄發送時間 (用於頻率限制)
            verificationService.recordSendTime(email);
            
            // 8. 發送驗證碼到信箱
            emailService.sendVerificationCode(email, verificationCode);
            
            response.put("success", true);
            response.put("message", "驗證碼已發送到您的信箱");
            response.put("token", token);
            response.put("expiresIn", 300); // 5分鐘 = 300秒
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "郵件發送失敗,請稍後再試");
            return ResponseEntity.status(500).body(response);
        }
    }
    // @PostMapping("/send-verification-code")
    // public ResponseEntity<Map<String, Object>> sendVerificationCode(@RequestBody Map<String, String> request) {
    //     String email = request.get("email");
    //     Map<String, Object> response = new HashMap<>();

    //     // 1. 驗證信箱格式
    //     if (email == null || !email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")) {
    //         response.put("success", false);
    //         response.put("message", "信箱格式不正確");
    //         return ResponseEntity.badRequest().body(response);
    //     }

    //     // 2. 檢查信箱是否已註冊
    //     if (service.checkAc(email)) {
    //         response.put("success", false);
    //         response.put("message", "此信箱已被註冊");
    //         return ResponseEntity.badRequest().body(response);
    //     }

    //     // 3. 檢查發送頻率限制 (60秒內只能發送一次)
    //     Long lastSendTime = verificationCodeTimestamp.get(email);
    //     if (lastSendTime != null && System.currentTimeMillis() - lastSendTime < 60000) {
    //         long remainingSeconds = 60 - (System.currentTimeMillis() - lastSendTime) / 1000;
    //         response.put("success", false);
    //         response.put("message", "請等待 " + remainingSeconds + " 秒後再試");
    //         response.put("remainingSeconds", remainingSeconds);
    //         return ResponseEntity.badRequest().body(response);
    //     }

    //     try {
    //         // 4. 生成6位數驗證碼
    //         String verificationCode = String.format("%06d", new Random().nextInt(999999));

    //         // 5. 加密驗證碼
    //         String codeHash = BCrypt.hashpw(verificationCode, BCrypt.gensalt());

    //         // 6. 生成 JWT Token
    //         String token = jwt.generateEmailVerificationToken(email, codeHash);

    //         // 7. 記錄發送時間
    //         verificationCodeTimestamp.put(email, System.currentTimeMillis());

    //         // 8. 重置嘗試次數
    //         verificationAttempts.put(email, 0);

    //         // 9. 發送驗證碼到信箱 (TODO: 實作郵件服務)
    //         // emailService.sendVerificationCode(email, verificationCode);
    //         // 開發環境顯示驗證碼
    //         System.out.println("=================================");
    //         System.out.println("📧 信箱: " + email);
    //         System.out.println("🔢 驗證碼: " + verificationCode);
    //         System.out.println("=================================");

    //         // 10. 5分鐘後自動清理
    //         new Thread(() -> {
    //             try {
    //                 Thread.sleep(5 * 60 * 1000);
    //                 verificationCodeTimestamp.remove(email);
    //                 verificationAttempts.remove(email);
    //             } catch (InterruptedException e) {
    //                 Thread.currentThread().interrupt();
    //             }
    //         }).start();

    //         response.put("success", true);
    //         response.put("message", "驗證碼已發送到您的信箱");
    //         response.put("token", token);
    //         response.put("expiresIn", 300); // 5分鐘
    //         return ResponseEntity.ok(response);

    //     } catch (Exception e) {
    //         response.put("success", false);
    //         response.put("message", "系統錯誤,請稍後再試");
    //         return ResponseEntity.status(500).body(response);
    //     }
    // }

    /**
     * 驗證信箱驗證碼
     */
    @PostMapping("/verify-email-code")
    public ResponseEntity<Map<String, Object>> verifyEmailCode(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String code = request.get("code");
        Map<String, Object> response = new HashMap<>();
        // 1. 驗證輸入
        if (token == null || code == null || code.length() != 6) {
            response.put("success", false);
            response.put("message", "請輸入6位數驗證碼");
            return ResponseEntity.badRequest().body(response);
        }
        // 2. 驗證 Token 和驗證碼
        String email;
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(jwt.getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            email = claims.get("email", String.class);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Token 已過期,請重新發送驗證碼");
            return ResponseEntity.badRequest().body(response);
        }
        // 3. 檢查嘗試次數 (使用 Redis)
        if (!verificationService.canAttempt(email)) {
            response.put("success", false);
            response.put("message", "驗證碼錯誤次數過多,請重新發送驗證碼");
            response.put("remainingAttempts", 0);
            return ResponseEntity.badRequest().body(response);
        }
        // 4. 驗證驗證碼
        String validatedEmail = jwt.validateEmailVerificationToken(token, code);
        if (validatedEmail == null) {
            // 驗證失敗,增加嘗試次數
            int attempts = verificationService.incrementAttempts(email);
            int remaining = verificationService.getRemainingAttempts(email);
            response.put("success", false);
            response.put("message", "驗證碼錯誤,還剩 " + remaining + " 次機會");
            response.put("remainingAttempts", remaining);
            return ResponseEntity.badRequest().body(response);
        }
        // 5. 驗證成功,清除嘗試次數
        verificationService.clearAttempts(email);
        // 6. 生成註冊 Token
        String registrationToken = jwt.generateRegistrationToken(validatedEmail);
        response.put("success", true);
        response.put("message", "信箱驗證成功");
        response.put("registrationToken", registrationToken);
        response.put("email", validatedEmail);
        response.put("expiresIn", 600); // 10分鐘 = 600秒
        return ResponseEntity.ok(response);
    }
    // @PostMapping("/verify-email-code")
    // public ResponseEntity<Map<String, Object>> verifyEmailCode(@RequestBody Map<String, String> request) {
    //     String token = request.get("token");
    //     String code = request.get("code");
    //     Map<String, Object> response = new HashMap<>();

    //     // 1. 驗證輸入
    //     if (token == null || code == null || code.length() != 6) {
    //         response.put("success", false);
    //         response.put("message", "請輸入6位數驗證碼");
    //         return ResponseEntity.badRequest().body(response);
    //     }

    //     // 2. 從 Token 中取得 email
    //     String email;
    //     try {
    //         Claims claims = Jwts.parserBuilder()
    //                 .setSigningKey(jwt.getSigningKey())
    //                 .build()
    //                 .parseClaimsJws(token)
    //                 .getBody();
    //         email = claims.get("email", String.class);
    //     } catch (Exception e) {
    //         response.put("success", false);
    //         response.put("message", "Token 已過期,請重新發送驗證碼");
    //         return ResponseEntity.badRequest().body(response);
    //     }

    //     // 3. 檢查嘗試次數
    //     Integer attempts = verificationAttempts.getOrDefault(email, 0);
    //     if (attempts >= MAX_ATTEMPTS) {
    //         response.put("success", false);
    //         response.put("message", "驗證碼錯誤次數過多,請重新發送驗證碼");
    //         response.put("remainingAttempts", 0);
    //         // 清理資料
    //         verificationCodeTimestamp.remove(email);
    //         verificationAttempts.remove(email);
    //         return ResponseEntity.badRequest().body(response);
    //     }

    //     // 4. 驗證驗證碼
    //     String validatedEmail = jwt.validateEmailVerificationToken(token, code);

    //     if (validatedEmail == null) {
    //         // 驗證失敗,增加嘗試次數
    //         attempts++;
    //         verificationAttempts.put(email, attempts);
    //         int remaining = MAX_ATTEMPTS - attempts;

    //         response.put("success", false);
    //         response.put("message", "驗證碼錯誤,還剩 " + remaining + " 次機會");
    //         response.put("remainingAttempts", remaining);
    //         return ResponseEntity.badRequest().body(response);
    //     }

    //     // 5. 驗證成功,清除嘗試次數和時間戳
    //     verificationAttempts.remove(email);
    //     verificationCodeTimestamp.remove(email);

    //     // 6. 生成註冊 Token
    //     String registrationToken = jwt.generateRegistrationToken(validatedEmail);

    //     response.put("success", true);
    //     response.put("message", "信箱驗證成功");
    //     response.put("registrationToken", registrationToken);
    //     response.put("email", validatedEmail);
    //     response.put("expiresIn", 600); // 10分鐘
    //     return ResponseEntity.ok(response);
    // }

}
