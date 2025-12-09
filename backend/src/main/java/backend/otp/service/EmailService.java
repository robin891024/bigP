package backend.otp.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    /**
     * 發送驗證碼郵件
     */
    public void sendVerificationCode(String toEmail, String verificationCode) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("【會員註冊】信箱驗證碼");
            message.setText(buildEmailContent(verificationCode));
            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("郵件發送失敗: " + e.getMessage(), e);
        }
    }

    /**
     * 建立郵件內容
     */
    private String buildEmailContent(String code) {
        return String.format("""
            親愛的用戶您好,
            
            您的信箱驗證碼為: %s
            
            此驗證碼將在 5 分鐘後失效,請盡快完成驗證。
            
            如果這不是您本人的操作,請忽略此郵件。
            
            祝您使用愉快!
            """, code);
    }
}
