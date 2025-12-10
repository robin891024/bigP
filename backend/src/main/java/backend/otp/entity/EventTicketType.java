package backend.otp.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "event_ticket_type")

public class EventTicketType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private EventJpa event;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_template_id", nullable = false)
    private TicketType ticketType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "early_bird_config_id", nullable = false)
    private TicketDiscountConfig ticketDiscountConfig;

    @Column(name = "is_limited")
    private Boolean islimited;

    @Column(name = "custom_price", precision = 38, scale = 2)
    private BigDecimal customprice;

    @Column(name = "custom_limit")
    private Integer customlimit;//庫存量

    @Column(name = "created_at")
    private LocalDateTime createdat;

    @Column(name = "is_early_bird")
    private Boolean earlybirdticket;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public TicketType getTicketType() {
        return ticketType;
    }

    public void setTicketType(TicketType ticketType) {
        this.ticketType = ticketType;
    }

    public Boolean getIslimited() {
        return islimited;
    }

    public void setIslimited(Boolean islimited) {
        this.islimited = islimited;
    }

    public BigDecimal getCustomprice() {
        return customprice;
    }

    public void setCustomprice(BigDecimal customprice) {
        this.customprice = customprice;
    }

    public Integer getCustomlimit() {
        return customlimit;
    }

    public void setCustomlimit(Integer customlimit) {
        this.customlimit = customlimit;
    }

    public LocalDateTime getCreatedat() {
        return createdat;
    }

    public void setCreatedat(LocalDateTime createdat) {
        this.createdat = createdat;
    }

    public EventJpa getEvent() {
        return event;
    }

    public void setEvent(EventJpa event) {
        this.event = event;
    }

    public Boolean getEarlybirdticket() {
        return earlybirdticket;
    }

    public void setEarlybirdticket(Boolean earlybirdticket) {
        this.earlybirdticket = earlybirdticket;
    }

    public TicketDiscountConfig getTicketDiscountConfig() {
        return ticketDiscountConfig;
    }

    public void setTicketDiscountConfig(TicketDiscountConfig ticketDiscountConfig) {
        this.ticketDiscountConfig = ticketDiscountConfig;
    }

   


}
