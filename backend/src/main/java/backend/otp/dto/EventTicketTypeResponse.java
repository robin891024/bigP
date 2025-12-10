package backend.otp.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.Data;
@Data
public class EventTicketTypeResponse {
    private Long id;
    private Long eventId;
    private Long ticket_template_id;
    private String ticketType;
    private Boolean islimited;
    private BigDecimal customprice;
    private Integer customlimit;//庫存量
    private LocalDateTime createdat;
    private String description;

    //早鳥票相關
    private Boolean earlyBirdEnabled;
    private BigDecimal discountRate;
    private BigDecimal finalPrice;

}
