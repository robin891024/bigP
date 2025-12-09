package backend.otp.repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import backend.otp.dto.Announcement;

/**
 * 公告資料庫操作層
 * 負責從資料庫中獲取公告資料
 */
@Repository
public class AnnouncementRepository {

    private final JdbcTemplate jdbcTemplate;

    // 依賴注入 JdbcTemplate
    public AnnouncementRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // 輔助函式：將 ResultSet 映射到 Announcement 物件
    private Announcement mapRowToAnnouncement(ResultSet rs, int rowNum) throws SQLException {
        return new Announcement(
            rs.getLong("id"),
            rs.getString("title"),
            rs.getString("content"),
            rs.getTimestamp("created_at").toLocalDateTime(),
            rs.getLong("user_id"),
            // 【新增】從 ResultSet 中獲取 JOIN 查詢結果中的 'publisher_role'
            rs.getInt("role")
            
        );
    }

    /**
     * 獲取最新公告列表
     * @param limit 限制的數量 (如果為 null 或小於等於 0，則獲取全部)
     * @return 公告列表
     */
    public List<Announcement> findLatest(Integer limit) {
        // 基礎 SQL 語句
        String baseSql = "SELECT a.id, a.title, a.content, a.created_at, a.user_id, u.role AS role " // <-- 【關鍵新增】u.role
                     + "FROM announcement a "
                     + "JOIN user u ON a.user_id = u.id " // <-- 【關鍵新增】JOIN 查詢
                     + "ORDER BY a.created_at DESC";

        // 參數列表
        List<Object> params = new ArrayList<>();
        String sql = baseSql;

        // 動態處理 LIMIT 參數 (使用問號 ? 佔位符防止 SQL 注入)
        if (limit != null && limit > 0) {
            sql += " LIMIT ?";
            params.add(limit);
        }

        // 執行查詢
        return jdbcTemplate.query(sql, this::mapRowToAnnouncement, params.toArray());
    }
}