package backend.otp.entity;

import java.math.BigDecimal;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "ticket_discount_config")
public class TicketDiscountConfig {
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;
    private int  duration_days;
    private BigDecimal discount_rate;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public int getDuration_days() {
        return duration_days;
    }

    public void setDuration_days(int duration_days) {
        this.duration_days = duration_days;
    }

    public BigDecimal getDiscount_rate() {
        return discount_rate;
    }

    public void setDiscount_rate(BigDecimal discount_rate) {
        this.discount_rate = discount_rate;
    }
}
