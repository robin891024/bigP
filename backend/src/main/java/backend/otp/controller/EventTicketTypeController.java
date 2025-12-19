package backend.otp.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import backend.otp.dto.EventTicketTypeResponse;
import backend.otp.dto.StockChange;
import backend.otp.service.EventTicketTypeService;

@RestController
@RequestMapping("/api/eventtickettype")
public class EventTicketTypeController {
    @Autowired
    private EventTicketTypeService eventTicketTypeService;

    @GetMapping("/event_ticket_type")
    public List<EventTicketTypeResponse> getAll() {
        List<EventTicketTypeResponse> data = eventTicketTypeService.findAll();

        return data;
    }

    @GetMapping("/event_ticket_type/{eventId}")
    public List<EventTicketTypeResponse> getByEventId(@PathVariable Long eventId) {
        List<EventTicketTypeResponse> data = eventTicketTypeService.findByEventId(eventId);
        return data;
    }

    // 庫存減少
    @PutMapping("/{id}/decreaseStock")
    public ResponseEntity<?> decreaseStock(@PathVariable Long id, @RequestBody StockChange request) {
        try {
            //service成功時返回true
            eventTicketTypeService.decreaseStock(id, request.getQuantity());
            return ResponseEntity.ok("庫存減少成功");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (RuntimeException e) {
            //Service拋出的"庫存不足"或"票種ID錯誤"
            // HTTP 409 Conflict (衝突) 是處理樂觀鎖/庫存不足的標準狀態碼
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());    
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("扣庫存時發生錯誤");
        }
    }

    // 庫存增加
    @PutMapping("/{id}/increaseStock")
    public ResponseEntity<?> increaseStock(@PathVariable Long id, @RequestBody StockChange request) {
        try {
            boolean success = eventTicketTypeService.increaseStock(id, request.getQuantity());

            if (success) {
                return ResponseEntity.ok("庫存增加成功");
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("回滾失敗，票種ID錯誤");
            }
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("增加庫存時發生錯誤 " + e.getMessage());
        }
    }

}