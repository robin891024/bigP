package backend.otp.dto;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "event_title_page")
public class EventTitlePage {

    // 根據您的資料庫截圖，id 是主鍵
    @Id
    private Long id;

    // 映射 image_url 欄位
    @Column(name = "image_url") 
    private String imageUrl; // CamelCase for Java property

    // 建立時間 (可選，但最好包含)
    @Column(name = "created_at")
    private String createdAt; 
    
    // Spring Data JPA 需要無參數建構子
    public EventTitlePage() {}

    // 完整的建構子 (可選)
    public EventTitlePage(Long id, String imageUrl, String createdAt) {
        this.id = id;
        this.imageUrl = imageUrl;
        this.createdAt = createdAt;
    }

    // --- Getter and Setter ---

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }
}