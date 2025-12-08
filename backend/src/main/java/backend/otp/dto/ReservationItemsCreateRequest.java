package backend.otp.dto;

import lombok.Data;

@Data
public class ReservationItemsCreateRequest {
    private Long eventTicketTypeId;
    private Integer quantity;
}