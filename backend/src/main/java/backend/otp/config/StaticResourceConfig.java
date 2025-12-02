package backend.otp.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        
        // 🚨 修正路徑：確保使用 file:/// 協定，並且路徑尾部帶有斜線 '/'
        // 這是您圖片所在的uploads資料夾的絕對路徑
        String absolutePath = "file:///C:/Users/l8408/Desktop/github/openticket/otbackend/uploads/";

        // 映射 URL 路徑 /uploads/**
        // 這會將 http://localhost:8080/uploads/... 的請求導向到 absolutePath
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(absolutePath);
    }
}