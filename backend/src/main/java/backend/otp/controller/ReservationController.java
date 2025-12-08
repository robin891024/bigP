package backend.otp.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import backend.otp.dto.OrdersResponse;
import backend.otp.dto.ReservationsCreateRequest;
import backend.otp.entity.Orders;
import backend.otp.entity.Reservations;
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
    /**
     * 處理創建預定單的 POST 請求
     * 請求路徑: POST /api/reservations/item
     * 接收: ReservationsCreateRequest (JSON 格式)
     * 回應: ReservationResponse (JSON 格式)
     */ 
    @PostMapping("/create")
    public ResponseEntity<OrdersResponse> createReservationAndOrder(
        @RequestBody @Valid ReservationsCreateRequest request){
            // ReservationResponse response = reservationsService.createReservation(request);
            // return new ResponseEntity<>(response, HttpStatus.CREATED);
            System.out.println("Received reservation request: " + request);
        Reservations newReservation;
        Orders newOrder;
        try {
            newReservation = reservationsService.createReservation(request);
            Long reservationId = newReservation.getId();
            newOrder = ordersService.createOrder(reservationId);

            // Long orderId = newOrder.getId();
            OrdersResponse response = new OrdersResponse(
                newOrder.getId(),
                newOrder.getStatus(),
                newReservation.getId()
            );
            return new ResponseEntity<>(response, HttpStatus.CREATED);


        }catch(RuntimeException e){
            System.err.println("Error during reservation and order creation: " + e.getMessage());
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }
}