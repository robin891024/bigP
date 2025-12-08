package com.example.openticket.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.openticket.repository.ReservationItemsRepository;


@Service
public class ReservationItemsService {
    @Autowired
    private ReservationItemsRepository reservationItemsRepository;
}
