package com.example.openticket.controller;

import com.example.openticket.dto.Event;
import com.example.openticket.repository.EventRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.http.ResponseEntity;


import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {
	private final EventRepository eventRepository;
	
	public EventController(EventRepository eventRepository) {
		this.eventRepository = eventRepository;
	}
	
	@GetMapping
	public List<Event> getAllEvents() {
		return eventRepository.findAll();
	}
	
	// 取得單一活動介紹內容
	@GetMapping("/intro/{id}")
	public ResponseEntity<String> getEventIntro(@PathVariable Long id) {
		String intro = eventRepository.EventIntro(id);
		if (intro != null) {
			return ResponseEntity.ok(intro);
		} else {
			return ResponseEntity.notFound().build();
		}
	}
}
