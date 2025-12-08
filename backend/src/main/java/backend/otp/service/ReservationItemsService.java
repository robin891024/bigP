package backend.otp.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import backend.otp.repository.ReservationItemsRepository;


@Service
public class ReservationItemsService {
    @Autowired
    private ReservationItemsRepository reservationItemsRepository;
}
