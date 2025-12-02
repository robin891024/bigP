	
    package backend.otp.repository;
    
    import backend.otp.dto.Event;
    import org.springframework.jdbc.core.JdbcTemplate;
    import org.springframework.stereotype.Repository;
    
    import java.sql.ResultSet;
    import java.sql.SQLException;
    import java.util.List;
    
    @Repository
    public class EventRepository {
        private final JdbcTemplate jdbcTemplate;
        
        public EventRepository(JdbcTemplate jdbcTemplate) {
            this.jdbcTemplate = jdbcTemplate;
        }
        
        // 將 ResultSet 映射為 Event 物件
        private Event mapRowToEvent(ResultSet rs, int rowNum) throws SQLException {
            java.sql.Timestamp ts = rs.getTimestamp("event_start");
            String eventStart = (ts != null) ? ts.toString() : "";
            return new Event(
                rs.getLong("id"),
                "/images/test.jpg", // 給前端用的公開路徑
                rs.getString("address"),
                eventStart,
                rs.getString("title")
            );
        }
        
        // 查詢全部活動
        public List<Event> findAll() {
            String sql = "SELECT id, address, event_start, title FROM event ORDER BY id DESC";
            return jdbcTemplate.query(sql, this::mapRowToEvent);
        }

        // 查詢活動介紹內容
        public String EventIntro(Long eventId) {
            String sql = "SELECT content FROM event_detail WHERE event_id = ?";
            try {
                return jdbcTemplate.queryForObject(sql, String.class, eventId);
            } catch (Exception e) {
                return null;
            }
        }
    }
    