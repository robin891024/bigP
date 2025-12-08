package backend.otp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import backend.otp.entity.Orders;
@Repository
public interface OrdersRepository extends JpaRepository<Orders, Long>{
    
}
