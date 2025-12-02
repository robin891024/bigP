package backend.otp.controller;
import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import backend.otp.dto.Announcement;
import backend.otp.repository.AnnouncementRepository;

/**
 * 公告 API 處理器
 * 端點: /api/announcements
 */
@RestController
@RequestMapping("/api/announcements")
@CrossOrigin(origins = "http://localhost:5173") 
public class AnnouncementController {

    private final AnnouncementRepository announcementRepository;

    // 依賴注入 Repository
    public AnnouncementController(AnnouncementRepository announcementRepository) {
        this.announcementRepository = announcementRepository;
    }

    /**
     * 獲取公告列表
     * 接收可選的 limit 查詢參數
     * 範例: GET /api/announcements?limit=3
     */
    @GetMapping
    public List<Announcement> getAnnouncements(@RequestParam(required = false) Integer limit) {
        // 呼叫 Repository 獲取資料
        return announcementRepository.findLatest(limit);
    }
}