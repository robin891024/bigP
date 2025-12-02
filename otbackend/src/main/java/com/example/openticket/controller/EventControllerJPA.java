package com.example.openticket.controller;

import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.openticket.entity.Event;
import com.example.openticket.service.EventService;



@RestController
@RequestMapping("/api/events")
public class EventControllerJPA {

    @Autowired
    private EventService eventsService;

    @GetMapping("/all")
    public List<Event> getallEvents(){
        return eventsService.getallEvent();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getEvent(@PathVariable Long id) {
        return eventsService.getEventById(id)
                .map(event -> {//如果有找到event就做下面的事 
                    // 回傳 JSON 給前端
                    Map<String, Object> response = new HashMap<>();
                    response.put("id", event.getId());
                    response.put("title", event.getTitle());
                    // response.put("detail", event.getDetail());
                    response.put("event_start", event.getEvent_start());
                    response.put("event_end", event.getEvent_end());
                    response.put("address", event.getAddress());

                    return ResponseEntity.ok(response);// 如果有找到event就回傳200和event
                })

                .orElse(ResponseEntity.notFound().build());// 如果沒有就回傳404

    }
}