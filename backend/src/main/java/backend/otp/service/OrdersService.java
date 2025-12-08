package backend.otp.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import backend.otp.entity.Orders;
import backend.otp.entity.Reservations;
import backend.otp.repository.OrdersRepository;
import backend.otp.repository.ReservationsRepository;
import jakarta.transaction.Transactional;

@Service
public class OrdersService {
    @Autowired
    private OrdersRepository ordersRepository;
    @Autowired
    private ReservationsRepository reservationsRepository;


    /**
     * 創建一筆新的訂單 (Orders)，並與既有的預訂 (Reservations) 關聯。
     * @param reservationId 預訂的 ID
     * @return 成功創建的 Orders 實體
     */

    @Transactional // 確保整個操作在一個事務中執行
    public Orders createOrder(Long reservationId) {
        // 1. 查找 Reservations 實體，如果找不到則拋出錯誤
        Reservations reservation = reservationsRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found with ID: " + reservationId));
        
        // 2. 創建新的 Orders 實體
        Orders newOrder = new Orders();
        
        // 3. 設定初始狀態
        // 假設初始狀態為 'PENDING'(取決於您的支付邏輯)
        newOrder.setStatus("PENDING"); 
        
        // 4. 設定關聯
        newOrder.setReservation(reservation); 

        // 5. 儲存訂單並返回
        return ordersRepository.save(newOrder);
    }


    /**
     * 更新訂單狀態。
     * @param orderId 訂單 ID
     * @param newStatus 新的狀態字串 (e.g., "SHIPPED", "CANCELLED")
     * @return 更新後的 Orders 實體
     */
    @Transactional
    public Orders updateOrderStatus(Long orderId, String newStatus) {
        Orders order = ordersRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));
        
        // 執行狀態檢查或業務規則驗證 (例如：不能從 CANCELLED 轉為 PAID)
        // ... (這裡可以添加您的業務邏輯) ...
        
        order.setStatus(newStatus);
        return ordersRepository.save(order);
    }
}
