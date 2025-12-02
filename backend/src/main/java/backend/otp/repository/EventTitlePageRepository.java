package backend.otp.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import backend.otp.dto.EventTitlePage;

@Repository
public interface EventTitlePageRepository extends JpaRepository<EventTitlePage, Long> {

    /**
     * 自訂查詢：獲取所有圖片的 URL，並限制結果數量 (假設只需要 3 張輪播圖)
     * 並按照創建時間降序排列 (可選的排序方式)
     */
    @Query("SELECT e.imageUrl FROM EventTitlePage e ORDER BY e.createdAt DESC")
    List<String> findHeroImageUrls();
    
    // 您也可以使用 JpaRepository 的 findAll()，但自定義查詢通常更高效，因為只返回需要的欄位
    
    // 如果您想獲取完整的實體列表：
    // List<EventTitlePage> findAll(); 
}
