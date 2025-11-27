package com.example.openticket.controller;

import com.example.openticket.dto.LogRequest;
import com.example.openticket.service.SessionLogService; // 引入 Service
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/log")
public class SessionLogController {

    private final SessionLogService sessionLogService; // 聲明 Service

    @Autowired // 通過構造函數注入 Service
    public SessionLogController(SessionLogService sessionLogService) {
        this.sessionLogService = sessionLogService;
    }

    @PostMapping("/session")
    public ResponseEntity<String> logSession(@RequestBody LogRequest logRequest) {
        
        String sessionId = logRequest.getSessionId();
        
        if (sessionId == null || sessionId.isEmpty()) {
            return ResponseEntity.badRequest().body("Session ID cannot be null.");
        }
        
        try {
            // *** 調用 Service 層方法來執行數據庫寫入 ***
            sessionLogService.saveNewSessionLog(sessionId); 
            
            return ResponseEntity.ok("Session logged successfully for ID: " + sessionId);
            
        } catch (Exception e) {
            // 記錄詳細錯誤，並返回 500 錯誤
            System.err.println("Error saving session log: " + e.getMessage());
            return ResponseEntity.internalServerError().body("Failed to log session due to internal error.");
        }
    }
}