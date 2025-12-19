package backend.otp.repository;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;

import backend.otp.entity.EventTicketType;
import jakarta.persistence.LockModeType;

public interface EventTicketTypeRepository extends JpaRepository<EventTicketType, Long> {
    // 悲觀鎖查詢
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<EventTicketType> findWithLockById(Long id);
}