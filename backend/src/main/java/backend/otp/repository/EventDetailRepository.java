package backend.otp.repository;

import backend.otp.entity.EventDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EventDetailRepository extends JpaRepository<EventDetail, Long> {
    Optional<EventDetail> findByEventId(Long eventId);
}
