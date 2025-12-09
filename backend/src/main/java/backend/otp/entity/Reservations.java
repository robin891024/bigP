package backend.otp.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import lombok.Data;

@Entity
@Data
public class Reservations {
    private Long id;
    
    @Column(name="user_id")
    private Long userId;
}
