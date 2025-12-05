package backend.otp.dto;

public class LogRequest {
    private String sessionId;
    // 如果您在前端傳輸了 page 參數，後端也需要接收
    private String page; 

    // Getters and Setters...
    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }
    public String getPage() { return page; }
    public void setPage(String page) { this.page = page; }
}
