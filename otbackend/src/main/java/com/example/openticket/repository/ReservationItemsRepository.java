package com.example.openticket.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.openticket.entity.ReservationItems;

@Repository
public interface ReservationItemsRepository extends JpaRepository<ReservationItems, Long>{
    
}
