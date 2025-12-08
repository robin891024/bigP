package com.example.openticket.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import lombok.Data;
@Data
public class ReservationResponse {
    //使用ID而非完整的Entity
    private Long id;
    private Long userId;
    private Long eventId;
    private Long eventTicketTypeId;

    private Integer quantity;
    private String status;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;
    private BigDecimal totalTicketPrice;
    private BigDecimal totalAmount;
    private List<ReservationItemsResponse> items;
    

}
