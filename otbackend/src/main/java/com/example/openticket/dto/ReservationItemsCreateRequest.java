package com.example.openticket.dto;

import lombok.Data;

@Data
public class ReservationItemsCreateRequest {
    private Long eventTicketTypeId;
    private Integer quantity;
}