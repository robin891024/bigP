package backend.otp.controller;

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
import backend.otp.service.OrdersService;
import backend.otp.service.ReservationsService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {
    @Autowired
    private ReservationsService reservationsService;

    @Autowired
    private OrdersService ordersService;

    @Autowired
    private MemberRepository memberRepository;

    /**
     * 處理創建預定單的 POST 請求
     * 請求路徑: POST /api/reservations/item
     * 接收: ReservationsCreateRequest (JSON 格式)
     * 回應: ReservationResponse (JSON 格式)
     */
    @PostMapping("/create")
    public ResponseEntity<OrdersResponse> createReservationAndOrder(
            @RequestBody @Valid ReservationsCreateRequest request,
            Authentication authentication) {
        try {
            // 1) Resolve current user: prefer request.userId, otherwise use Authentication
            if (request.getUserId() == null) {
                if (authentication == null || !authentication.isAuthenticated()) {
                    // 未登入
                    throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "未登入，請先登入後再購票");
                }

                // authentication.getName() 通常是 username/email，依你實作而定
                String username = authentication.getName();
                Long userId = memberRepository.findIdByAccount(username);

                if (userId == null) {
                    throw new ResponseStatusException(
                            HttpStatus.UNAUTHORIZED,
                            "找不到會員 (account=" + username + ")");
                }

                request.setUserId(userId);
            }

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
}