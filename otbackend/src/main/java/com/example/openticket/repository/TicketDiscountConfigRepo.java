package com.example.openticket.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.openticket.entity.TicketDiscountConfig;

@Repository
public interface TicketDiscountConfigRepo extends JpaRepository<TicketDiscountConfig, Long>{
    
}
