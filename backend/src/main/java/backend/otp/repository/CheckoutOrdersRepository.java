package backend.otp.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import backend.otp.entity.CheckoutOrders;

@Repository
public interface  CheckoutOrdersRepository extends JpaRepository<CheckoutOrders, Long>{
    
    List<CheckoutOrders> findAllByOrder_Id(Long orderId);

    List<CheckoutOrders> findAllByOrder_Reservation_User_Id(Long userId);
}
