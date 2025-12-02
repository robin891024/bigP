package com.example.openticket.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.openticket.entity.Event;
import com.example.openticket.repository.EventRepositoryJPA;




@Service
public class EventService {
    @Autowired
    private EventRepositoryJPA eventsRepository;

    public Optional<Event> getEventById(Long id) {//透過id取得活動資料
        return eventsRepository.findById(id);
    }

    public List<Event> getallEvent(){
        return eventsRepository.findAll();
    }
    // public  List<Events> findActiveEvents(Status status){
    //     return eventsRepository.findByActiveTrue();
    // }
    

}
