package backend.otp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import backend.otp.entity.TicketDiscountConfig;

@Repository
public interface TicketDiscountConfigRepo extends JpaRepository<TicketDiscountConfig, Long>{
    
}
