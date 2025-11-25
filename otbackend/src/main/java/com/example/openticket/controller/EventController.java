package com.example.openticket.controller;

import com.example.openticket.dto.Event;
import com.example.openticket.repository.EventRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
