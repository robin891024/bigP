package backend.otp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import backend.otp.entity.Reservations;

@Repository
public interface ReservationsRepository extends JpaRepository<Reservations, Long>{
    
}
