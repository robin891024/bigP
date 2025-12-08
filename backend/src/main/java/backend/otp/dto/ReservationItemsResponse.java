package backend.otp.dto;

import java.math.BigDecimal;

import lombok.Data;
@Data
public class ReservationItemsResponse {
    private Long id;
    private Long reservationId;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal subtotalPrice;
    private Long eventTicketTypeId;

}
