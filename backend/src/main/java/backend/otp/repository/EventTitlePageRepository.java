package backend.otp.repository;

import backend.otp.entity.EventTitlePageEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EventTitlePageRepository extends JpaRepository<EventTitlePageEntity, Long> {
    
    Optional<EventTitlePageEntity> findFirstByEventIdOrderByCreatedAtDesc(Long eventId);

    List<EventTitlePageEntity> findAllByOrderByCreatedAtDesc();
}

