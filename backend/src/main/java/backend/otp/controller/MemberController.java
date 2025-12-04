package backend.otp.controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
import backend.otp.service.LoginLogService;
import backend.otp.service.MemberService;
import backend.otp.utils.BCrypt;
import backend.otp.utils.JWTutils;
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

    @PostMapping("/register")
    public ResponseEntity<Map<String, Boolean>> register(@RequestBody Member member) {

        Map<String, Boolean> map = new HashMap<>();

        map.put("success", service.register(member));

        return ResponseEntity.ok(map);
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

}
