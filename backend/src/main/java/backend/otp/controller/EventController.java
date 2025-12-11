package backend.otp.controller;

import backend.otp.dto.EventDto;
import backend.otp.dto.EventStatsDto;
import backend.otp.dto.EventDailyStatsDto;
import backend.otp.repository.EventDetailRepository;
import backend.otp.repository.EventRepositoryJPA;
import backend.otp.repository.EventTitlePageRepository;
import backend.otp.service.EventStatsService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;
import java.util.Comparator;
import backend.otp.entity.EventJpa;
import backend.otp.entity.EventTitlePageEntity;

@RestController
@RequestMapping("/api/events")
public class EventController {
	private final EventStatsService eventStatsService;
	private final EventDetailRepository eventDetailRepository;
	private final EventRepositoryJPA eventRepositoryJPA;
	private final EventTitlePageRepository eventTitlePageRepository;

	public EventController(EventStatsService eventStatsService,
			EventDetailRepository eventDetailRepository, EventRepositoryJPA eventRepositoryJPA,
			EventTitlePageRepository eventTitlePageRepository) {
		this.eventStatsService = eventStatsService;
		this.eventDetailRepository = eventDetailRepository;
		this.eventRepositoryJPA = eventRepositoryJPA;
		this.eventTitlePageRepository = eventTitlePageRepository;
	}

	@GetMapping
	public List<EventDto> getAllEvents() {
		// 1. 取得所有活動
		List<EventJpa> events = eventRepositoryJPA.findAll();
		
		// 2. 取得所有圖片資訊 (按建立時間倒序)
		List<EventTitlePageEntity> images = eventTitlePageRepository.findAllByOrderByCreatedAtDesc();
		
		// 3. 建立 EventId -> ImageUrl 的 Map (只保留最新的)
		Map<Long, String> imageMap = new HashMap<>();
		for (EventTitlePageEntity img : images) {
			imageMap.putIfAbsent(img.getEventId(), img.getImageUrl());
		}

		// 4. 轉換為 DTO 並回傳 (按 ID 倒序排列，與原本 JDBC 行為一致)
		return events.stream()
				.sorted(Comparator.comparing(EventJpa::getId).reversed())
				.map(eventJpa -> {
					String imageUrl = imageMap.getOrDefault(eventJpa.getId(), "/api/images/covers/test.jpg");
					
					// 處理圖片路徑轉換
					if (!imageUrl.equals("/api/images/covers/test.jpg")) {
						String path = imageUrl;
						if (path.contains("/")) {
							path = path.substring(path.lastIndexOf("/") + 1);
						}
						if (path.contains("\\")) {
							path = path.substring(path.lastIndexOf("\\") + 1);
						}
						imageUrl = "/api/images/covers/" + path;
					}

					return new EventDto(
							eventJpa.getId(),
							imageUrl,
							eventJpa.getAddress(),
							eventJpa.getEvent_start() != null ? eventJpa.getEvent_start().toString() : "",
							eventJpa.getTitle());
				})
				.collect(Collectors.toList());
	}

	// 取得單一活動
	@GetMapping("/detail/{id}")
	public ResponseEntity<EventDto> getEventById(@PathVariable Long id) {
		return eventRepositoryJPA.findById(id)
				.map(eventJpa -> {
					String imageUrl = eventTitlePageRepository.findFirstByEventIdOrderByCreatedAtDesc(id)
							.map(img -> {
								String path = img.getImageUrl();
								if (path.contains("/")) {
									path = path.substring(path.lastIndexOf("/") + 1);
								}
								if (path.contains("\\")) {
									path = path.substring(path.lastIndexOf("\\") + 1);
								}
								return "/api/images/covers/" + path;
							})
							.orElse("/api/images/covers/test.jpg");

					return new EventDto(
							eventJpa.getId(),
							imageUrl,
							eventJpa.getAddress(),
							eventJpa.getEvent_start() != null ? eventJpa.getEvent_start().toString() : "",
							eventJpa.getTitle());
				})
				.map(ResponseEntity::ok)
				.orElse(ResponseEntity.notFound().build());
	}

	// 取得單一活動介紹內容
	@GetMapping("/intro/{id}")
	public ResponseEntity<String> getEventIntro(@PathVariable Long id) {
		return eventDetailRepository.findByEventId(id)
				.map(detail -> ResponseEntity.ok(detail.getContent()))
				.orElse(ResponseEntity.notFound().build());
	}

	// 取得活動總瀏覽/分享數
	@GetMapping("/{eventId}/stats")
	public ResponseEntity<EventStatsDto> getEventStats(@PathVariable Long eventId) {
		EventStatsDto stats = eventStatsService.getStats(eventId);
		return ResponseEntity.ok(stats);
	}

	// 活動瀏覽量 +1
	@PostMapping("/{eventId}/stats/view")
	public ResponseEntity<Void> addView(@PathVariable Long eventId) {
		eventStatsService.addView(eventId);
		return ResponseEntity.ok().build();
	}

	// 活動分享量 +1
	@PostMapping("/{eventId}/stats/share")
	public ResponseEntity<Void> addShare(@PathVariable Long eventId) {
		eventStatsService.addShare(eventId);
		return ResponseEntity.ok().build();
	}

	// 取得活動每日瀏覽/分享數
	@GetMapping("/{eventId}/daily-stats")
	public ResponseEntity<EventDailyStatsDto> getDailyStats(
			@PathVariable Long eventId,
			@org.springframework.web.bind.annotation.RequestParam String date) {
		EventDailyStatsDto stats = eventStatsService.getDailyStats(eventId, date);
		return ResponseEntity.ok(stats);
	}

	// 活動每日瀏覽量 +1
	@PostMapping("/{eventId}/daily-stats/view")
	public ResponseEntity<Void> addDailyView(@PathVariable Long eventId) {
		eventStatsService.addDailyView(eventId);
		return ResponseEntity.ok().build();
	}

	// 活動每日分享量 +1
	@PostMapping("/{eventId}/daily-stats/share")
	public ResponseEntity<Void> addDailyShare(@PathVariable Long eventId) {
		eventStatsService.addDailyShare(eventId);
		return ResponseEntity.ok().build();
	}
}
