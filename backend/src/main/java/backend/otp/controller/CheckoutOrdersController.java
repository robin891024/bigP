package backend.otp.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import backend.otp.dto.CheckoutOrdersDto;
import backend.otp.service.CheckoutOrdersService;


@Controller
@RequestMapping("/checkoutOrders")
public class CheckoutOrdersController {

    @Autowired
    private CheckoutOrdersService checkoutService;

    @GetMapping("/getAll")
    public ResponseEntity<List<CheckoutOrdersDto>> getAllCheckoutOrders(@RequestParam Long userId) {
        List<CheckoutOrdersDto> checkorders = checkoutService.getUserCheckoutOrders(userId);
        return ResponseEntity.ok(checkorders);
    }
    
}
