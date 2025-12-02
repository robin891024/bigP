package com.example.openticket.service;

import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.openticket.entity.HomepageSessionLog;
import com.example.openticket.repository.HomepageSessionLogRepository;

@Service
public class SessionLogService {

    private final HomepageSessionLogRepository logRepository;

    @Autowired
    public SessionLogService(HomepageSessionLogRepository logRepository) {
        this.logRepository = logRepository;
    }

    @Transactional // 確保整個方法在一個數據庫事務中運行
    public HomepageSessionLog saveNewSessionLog(String sessionId) {
        
        // --- 核心修正邏輯：計算出 Asia/Taipei 時區的 Instant ---
        // 1. 獲取當前時間的 ZonedDateTime (帶有 JVM 系統時區)
        ZonedDateTime now = ZonedDateTime.now();
        
        // 2. 轉換為 'Asia/Taipei' 時區的 ZonedDateTime
        // 這是確保時間點正確的關鍵
        ZonedDateTime taipeiZonedDateTime = now.withZoneSameInstant(ZoneId.of("Asia/Taipei"));
        
        // 3. 提取出這個時間點的絕對 Instant 值
        Instant taipeiInstant = taipeiZonedDateTime.toInstant();
        // ----------------------------------------------------
        
        // 1. 創建新的實體對象
        HomepageSessionLog newLog = new HomepageSessionLog();
        
        // 2. 設置 Session ID
        newLog.setSessionId(sessionId);
        
        // 3. 【修正點！】設置首次訪問時間
        // 使用我們手動轉換、代表 Asia/Taipei 時區的絕對時間點
        newLog.setFirstVisit(taipeiInstant); 
        
        // 4. 調用 Repository 儲存到數據庫
        HomepageSessionLog savedLog = logRepository.save(newLog);
        
        return savedLog;
    }
  
}
