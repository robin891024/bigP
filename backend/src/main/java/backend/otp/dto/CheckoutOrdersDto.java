package backend.otp.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.Data;

@Data
public class CheckoutOrdersDto {
    private String eventName;
    private String ticketTypeName;
    private BigDecimal unitPrice;
    private int quantity;
    private LocalDateTime purchaseDate;
    private String orderStatus;
}
