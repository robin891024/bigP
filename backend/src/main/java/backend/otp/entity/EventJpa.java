package backend.otp.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.*;

@Entity
@Table(name = "event")//本地端建立的為events，正式端是event

public class EventJpa {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;
    private String address;
    
    private LocalDate event_start;//型別設定為LocalDate 不含時間、不含時區 → 不會因為部署地變動而產生日期跑掉的情況。
    private LocalDate event_end;
    private LocalDateTime sale_start;//LocalDateTime 也不帶時區 → 適合表示單純的“當地時間”。
    

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public LocalDate getEvent_start() {
        return event_start;
    }

    public void setEvent_start(LocalDate event_start) {
        this.event_start = event_start;
    }

    public LocalDate getEvent_end() {
        return event_end;
    }

    public void setEvent_end(LocalDate event_end) {
        this.event_end = event_end;
    }

    public LocalDateTime getSale_start() {
        return sale_start;
    }

    public void setSale_start(LocalDateTime sale_start) {
        this.sale_start = sale_start;
    }

}
