package backend.otp.entity;

import java.time.LocalDate;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name="event")
@Data
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private Long status_id;

    @Column(name = "event_start")
    private LocalDate eventStartDate;

    @Column(name = "event_end")
    private LocalDate eventEndDate;

    private String address;

    //---------------------------------------

    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Member organizer;  // 改為 Member，因為 company 和 user 已合併
}