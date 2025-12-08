package backend.otp.dto;

import java.util.List;

import lombok.Data;

@Data
public class ReservationsCreateRequest {
    private Long userId;
    private Long eventId;
    private List<ReservationItemsCreateRequest> items;

}
