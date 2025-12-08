package backend.otp.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@NoArgsConstructor 
@AllArgsConstructor 
public class OrdersResponse {
    private Long id;
    private String status;
    private Long reservations_id;
}
