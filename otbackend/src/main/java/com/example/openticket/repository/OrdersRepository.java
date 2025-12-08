package com.example.openticket.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.openticket.entity.Orders;
@Repository
public interface OrdersRepository extends JpaRepository<Orders, Long>{
    
}
