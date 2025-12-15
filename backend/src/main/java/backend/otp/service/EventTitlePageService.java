package backend.otp.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import backend.otp.repository.EventTitlePageRepository;

@Service
public class EventTitlePageService {

    @Autowired
    private EventTitlePageRepository repository;

    /**
     * 獲取用於 Hero 區塊的圖片 URL 列表
     * @return 圖片 URL (String) 的列表
     */
    public List<String> getHeroImageUrls() {
        return repository.findAllByOrderByCreatedAtDesc().stream()
                .map(entity -> {
                    String path = entity.getImageUrl();
                    if (path.contains("/")) {
                        path = path.substring(path.lastIndexOf("/") + 1);
                    }
                    if (path.contains("\\")) {
                        path = path.substring(path.lastIndexOf("\\") + 1);
                    }
                    return "/api/images/covers/" + path;
                })
                .toList();
    }
}
