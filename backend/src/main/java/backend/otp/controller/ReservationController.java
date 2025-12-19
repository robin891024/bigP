package backend.otp.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import backend.otp.dto.OrdersResponse;
import backend.otp.dto.ReservationsCreateRequest;
import backend.otp.entity.Orders;
import backend.otp.entity.Reservations;
import backend.otp.repository.MemberRepository;
import backend.otp.service.MemberService;
import backend.otp.service.OrderService;
import backend.otp.service.OrdersService;
import backend.otp.service.ReservationsService;
import backend.otp.utils.JWTutils;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {
    @Autowired
    private ReservationsService reservationsService;

    @Autowired
    private OrdersService ordersService;

    @Autowired
    private OrderService orderService;

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private MemberService memberService;

    @Autowired
    private JWTutils jwt;

    /**
     * 處理創建預定單的 POST 請求
     * 請求路徑: POST /api/reservations/item
     * 接收: ReservationsCreateRequest (JSON 格式)
     * 回應: ReservationResponse (JSON 格式)
     */
    @PostMapping("/create")
    public ResponseEntity<OrdersResponse> createReservationAndOrder(
            @RequestBody @Valid ReservationsCreateRequest request,
            HttpServletRequest servletRequest,
            Authentication authentication) {
        try {
                Long userId = request.getUserId();
            // 1) Resolve current user: prefer request.userId, otherwise use Authentication
            if (userId == null) {
            String jwtToken = getJwtFromCookie(servletRequest);
            
            if (jwtToken != null && jwt.validateToken(jwtToken)) {
                String account = jwt.getUsernameFromToken(jwtToken);
                userId = memberRepository.findIdByAccount(account);
            } else if (authentication != null && authentication.isAuthenticated()) {
                // 如果 Cookie 抓不到但 Security 抓得到（雙重保險）
                userId = memberRepository.findIdByAccount(authentication.getName());
            }
        }
                if (userId == null) {
                    throw new ResponseStatusException(
                            HttpStatus.UNAUTHORIZED,
                            "找不到會員 (account=" + authentication.getName() + ")");
                }

                request.setUserId(userId);
            

            // 2) 呼叫 service 建立 reservation 並建立 order
            Reservations newReservation = reservationsService.createReservation(request);
            Orders newOrder = ordersService.createOrder(newReservation.getId());

            // 3) 回傳 order 資訊
            OrdersResponse response = new OrdersResponse(
                    newOrder.getId(),
                    newOrder.getStatus(),
                    newReservation.getId());

            return new ResponseEntity<>(response, HttpStatus.CREATED);

        } catch (ResponseStatusException rse) {
            // 已帶有適當 HTTP 狀態的錯誤
            throw rse;
        } catch (RuntimeException ex) {
            // 未預期錯誤：把訊息回前端並標示為 400（或視情況回 500）
            String msg = ex.getMessage() == null ? "建立失敗" : ex.getMessage();
            System.err.println("Error during reservation and order creation: " + msg);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, msg, ex);
        }
    }
    
    // System.out.println("Received reservation request: " + request);
    // Reservations newReservation;
    // Orders newOrder;
    // try {
    // newReservation = reservationsService.createReservation(request);
    // Long reservationId = newReservation.getId();
    // newOrder = ordersService.createOrder(reservationId);

    // // Long orderId = newOrder.getId();
    // OrdersResponse response = new OrdersResponse(
    // newOrder.getId(),
    // newOrder.getStatus(),
    // newReservation.getId()
    // );
    // return new ResponseEntity<>(response, HttpStatus.CREATED);

    // }catch(RuntimeException e){
    // System.err.println("Error during reservation and order creation: " +
    // e.getMessage());
    // return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
    // }
    // }

    @PostMapping("/change")
    public ResponseEntity<Map<String, Object>> changeState (@RequestBody Map<String, Long> body, HttpServletRequest request) {
        String jwtToken = getJwtFromCookie(request);
        Map<String, Object> res = new HashMap<>();

        if (jwtToken != null && jwt.validateToken(jwtToken)) {
            String account = jwt.getUsernameFromToken(jwtToken);
            
            Long userId = memberService.findIdByAccount(account);

            boolean isexist = reservationsService.checkReservations(body.get("reservationId"), userId);

            if (isexist) {
                if(orderService.changeState(body.get("reservationId"))) {
                    res.put("success", true);
                    res.put("message", "訂單修改完成");
                }else {
                    res.put("success", false);
                    res.put("message", "訂單修改失敗");
                }
            }else {
                res.put("success", isexist);
                res.put("message", "該訂單不存在或已過期");
            }

        }else {
            res.put("success", false);
            res.put("message", "未登入");
        }
        return ResponseEntity.ok(res);
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
}