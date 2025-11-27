package com.example.openticket.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import java.time.Instant;

/**
 * 對應數據庫表: otp.homepage_session_log
 */
@Entity
@Table(name = "homepage_session_log", schema = "otp") // 設置表名和 schema (如果有)
public class HomepageSessionLog {

    // 對應: id - 紀錄ID | bigint NOT NULL
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // 自動增長策略
    private Long id;

    // 對應: first_visit - 首次訪問時間 | timestamp NOT NULL
    @Column(name = "first_visit", nullable = false)
    private Instant firstVisit; // 使用 Instant 來表示時間戳記

    // 對應: session_id - Session識別碼 | varchar(100) NOT NULL
    @Column(name = "session_id", length = 100, nullable = false)
    private String sessionId;

    // --- 構造函數 (Constructors) ---

    public HomepageSessionLog() {
    }

    public HomepageSessionLog(String sessionId, Instant firstVisit) {
        this.sessionId = sessionId;
        this.firstVisit = firstVisit;
    }
    
    // --- Getters and Setters (省略部分代碼，請在實際開發中添加) ---
    
    // Getters
    public Long getId() {
        return id;
    }

    public Instant getFirstVisit() {
        return firstVisit;
    }

    public String getSessionId() {
        return sessionId;
    }
    
    // Setters
    public void setId(Long id) {
        this.id = id;
    }

    public void setFirstVisit(Instant firstVisit) {
        this.firstVisit = firstVisit;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }
}
