package backend.otp.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import backend.otp.service.EventTitlePageService;

@RestController
@RequestMapping("/api")
// ⚠️ 重要：如果您的 React 專案運行在不同 Port，需要設定 CORS
@CrossOrigin(origins = "http://localhost:5173") // 替換為您的前端網址
public class HeroController {

    @Autowired
    private EventTitlePageService service;

    /**
     * API Endpoint: GET /api/hero-images
     * 返回圖片 URL 列表
     */
    @GetMapping("/hero-images")
    public List<String> getHeroImages() {
        return service.getHeroImageUrls();
    }
}