package backend.otp.dto;

import java.time.LocalDateTime;

/**
 * 公告的資料傳輸物件 (DTO)，用於在各層之間傳遞資料。
 */
public class Announcement {

    private Long id;
    private String title;
    private String content;
    private LocalDateTime created_at; // 與資料庫欄位名稱保持一致

    // 完整的建構函式 (與 Repository 中的 mapRowToAnnouncement 匹配)
    public Announcement(Long id, String title, String content, LocalDateTime created_at) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.created_at = created_at;
    }

    // 預設建構函式
    public Announcement() {
    }

    // --- Getter 和 Setter (讓 Spring 可以序列化為 JSON) ---

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public LocalDateTime getCreated_at() {
        return created_at;
    }

    public void setCreated_at(LocalDateTime created_at) {
        this.created_at = created_at;
    }
}