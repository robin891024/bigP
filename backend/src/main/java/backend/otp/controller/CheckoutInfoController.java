package backend.otp.controller;

import java.util.List;
import java.math.BigDecimal; // 引入 BigDecimal 類別

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

// DTO 和 Entity
import backend.otp.dto.ReservationCheckoutDto;
import backend.otp.entity.EventTicketType;
import backend.otp.entity.Reservation;
import backend.otp.entity.ReservationItem;
import backend.otp.entity.TicketType;

// Repositories
import backend.otp.repository.EventTicketTypeRepository;
import backend.otp.repository.MemberRepository;
import backend.otp.repository.ReservationItemRepository;
import backend.otp.repository.ReservationRepository;
import backend.otp.repository.TicketTypeRepository;
import backend.otp.repository.UserRepository;


@RestController
@RequestMapping("/api/reservations")
public class CheckoutInfoController {

    // 只需要讀取結帳資訊所需的 Repository
    @Autowired
    private EventTicketTypeRepository eventTicketTypeRepository;
    @Autowired
    private TicketTypeRepository ticketTypeRepository;
    @Autowired
    private ReservationRepository reservationRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ReservationItemRepository reservationItemRepository;

    @Autowired // 必須加入 MemberRepository 來解析用戶 ID
    private MemberRepository memberRepository;


    @GetMapping("/{id}/checkout")
    public ResponseEntity<?> getCheckoutInfo(@PathVariable Long id, Authentication authentication) {

        // --- 授權檢查 (Start) ---
        // 1. 確保用戶已認證
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "未登入，請先登入後再查詢");
        }

        // 2. 解析當前登入用戶的 ID
        String username = authentication.getName();
        
        // 修正：使用 @Autowired 的實例變數 memberRepository
        Long currentUserId = memberRepository.findIdByAccount(username); 

        // ❗ 暫時加入日誌打印，確認解析出的 currentUserId ❗
        System.out.println("DEBUG: 當前登入的會員帳號: " + username);
        System.out.println("DEBUG: 當前登入的會員 ID: " + currentUserId);


        if (currentUserId == null) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "找不到會員 (account=" + username + ")，請重新登入");
        }

        // 3. 找預約單
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "找不到預約單 ID: " + id));

        // 4. 業務邏輯檢查：驗證所有權 (解決 403 的核心)
        if (reservation.getUserId() == null || !reservation.getUserId().equals(currentUserId)) {
            
            // ❗ 額外日誌用於 403 錯誤除錯 ❗
            System.err.println("403 Forbidden: Reservation ID " + id + " 屬於用戶 " + reservation.getUserId() + 
                               " 但當前用戶為 " + currentUserId);
            
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "無權訪問此預約單 (預約單不屬於您)");
        }
        // --- 授權檢查 (End) ---


        // 5. 執行原本的數據獲取和計算邏輯
        ReservationCheckoutDto dto = new ReservationCheckoutDto();
        dto.setReservationId(reservation.getId());

        // 補上使用者資訊
        if (reservation.getUserId() != null) {
            userRepository.findById(reservation.getUserId()).ifPresent(user -> {
                // 假設 user Entity 有 getUsername() 和 getAccount()
                dto.setUserName(user.getUsername());
                dto.setUserEmail(user.getAccount());
            });
        } else {
            dto.setUserName("訪客");
            dto.setUserEmail("無");
        }

        // 撈明細並準備計算
        // 修正：使用 @Autowired 的實例變數 reservationItemRepository
        List<ReservationItem> items = reservationItemRepository.findByReservationsId(id); 

        BigDecimal calculatedTotal = BigDecimal.ZERO; // 使用 BigDecimal.ZERO

        if (items != null) {
            for (ReservationItem item : items) {
                // 查票名邏輯
                String ticketName = "未知票種";
                
                // 1. 取得 EventTicketType 實體
                EventTicketType ett = eventTicketTypeRepository.findById(item.getEventTicketTypeId()).orElse(null);
                
                if (ett != null) {
                    // 【修正處】：直接使用 ett.getTicketType() 獲取關聯的 TicketType 實體
                    TicketType tt = ett.getTicketType(); 
                    
                    // 2. 判斷是否成功獲取 TicketType
                    if (tt != null) {
                        ticketName = tt.getName();
                    }
                }
                
                // 拿到單價跟數量，並累加總金額
                BigDecimal unitPrice = item.getUnitPrice() != null ? item.getUnitPrice() : BigDecimal.ZERO;
                BigDecimal quantity = new BigDecimal(item.getQuantity());

                // 累加：總數 = 總數 + (單價 * 數量)
                calculatedTotal = calculatedTotal.add(unitPrice.multiply(quantity));

                dto.getItems().add(new ReservationCheckoutDto.ItemDto(
                    ticketName,
                    unitPrice,
                    item.getQuantity()
                ));
            }
        }

        // 雙保險邏輯：優先用資料庫的，沒值才用算的
        if (reservation.getTotalAmount() != null) {
            dto.setTotalAmount(reservation.getTotalAmount());
        } else {
            dto.setTotalAmount(calculatedTotal);
        }

        return ResponseEntity.ok(dto);
    }
}