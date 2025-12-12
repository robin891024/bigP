package backend.otp.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import backend.otp.entity.Reservations;

@Repository
public interface ReservationsRepository extends JpaRepository<Reservations, Long>{

    @Query("SELECT r.id FROM Reservations r WHERE r.user.id = :userId")
    List<Long> findAllIdByUser_Id(Long userId);
}
