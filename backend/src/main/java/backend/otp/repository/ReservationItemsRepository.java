package backend.otp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import backend.otp.entity.ReservationItems;

@Repository
public interface ReservationItemsRepository extends JpaRepository<ReservationItems, Long>{
    
}
