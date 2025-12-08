package com.example.openticket.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.openticket.entity.Reservations;
@Repository
public interface ReservationsRepository extends JpaRepository<Reservations, Long>{
    
}
