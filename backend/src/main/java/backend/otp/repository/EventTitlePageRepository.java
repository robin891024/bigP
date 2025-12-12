package backend.otp.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import backend.otp.entity.EventTitlePageEntity;

@Repository
public interface EventTitlePageRepository extends JpaRepository<EventTitlePageEntity, Long> {
    
    Optional<EventTitlePageEntity> findFirstByEventIdOrderByCreatedAtDesc(Long eventId);

    List<EventTitlePageEntity> findAllByOrderByCreatedAtDesc();
}

