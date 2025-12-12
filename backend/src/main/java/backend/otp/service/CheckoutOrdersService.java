package backend.otp.service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import backend.otp.dto.CheckoutOrdersDto;
import backend.otp.entity.CheckoutOrders;
import backend.otp.entity.EventTicketType;
import backend.otp.entity.Orders;
import backend.otp.entity.Reservations;
import backend.otp.repository.CheckoutOrdersRepository;
import backend.otp.repository.OrdersRepository;
import backend.otp.repository.ReservationsRepository;

@Service
public class CheckoutOrdersService {

    @Autowired
    private ReservationsRepository reservationsRepo;

    @Autowired
    private OrdersRepository ordersRepo;

    @Autowired
    private CheckoutOrdersRepository checkoutRepo;

    public List<CheckoutOrdersDto> getUserCheckoutOrders(Long userId) {

        List<CheckoutOrders> list = checkoutRepo.findAllByOrder_Reservation_User_Id(userId);

        return list.stream().map(o -> {

            CheckoutOrdersDto dto = new CheckoutOrdersDto();

            // ========== 結帳票價、數量 ==========
            dto.setUnitPrice(o.getUnitPrice());
            dto.setQuantity(o.getQuantity());

            // ========== 訂單狀態 ==========
            Orders order = o.getOrder();
            dto.setOrderStatus(order.getStatus());

            // ========== 購買日期（Reservation） ==========
            Reservations r = order.getReservation();
            dto.setPurchaseDate(r.getCreatedAt());

            // ========== 活動與票種：從 event_ticket_type 抓 ==========
            EventTicketType ett = o.getEventTicketType();

            // 票種名稱
            dto.setTicketTypeName(ett.getTicketType().getName());

            // 活動名稱（正確路線，不經過 reservations）
            dto.setEventName(
                    ett.getEvent().getTitle()
            );

            return dto;

        }).collect(Collectors.toList());
    }

    public List<CheckoutOrders> getAllCheckoutOrdersByuserId(Long userId) {
        List<Long> reservationsId = reservationsRepo.findAllIdByUser_Id(userId);

        List<CheckoutOrders> CheckoutOrders = new ArrayList<>();

        for (int i = 0; i < reservationsId.size(); i++) {
            Long id = reservationsId.get(i);
            Long orderId = ordersRepo.findIdByReservationIdAndStatusNot(id, "PENDING");
            if (orderId == null) {
                continue;
            }
            List<CheckoutOrders> checkoutOrder = checkoutRepo.findAllByOrder_Id(orderId);
            if (checkoutOrder != null) {
                for (int a = 0; a < checkoutOrder.size(); a++) {
                    CheckoutOrders.add(checkoutOrder.get(a));
                }

            }
        }

        return CheckoutOrders;
    }
}
