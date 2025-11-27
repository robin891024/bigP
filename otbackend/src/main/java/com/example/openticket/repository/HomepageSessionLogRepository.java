package com.example.openticket.repository;


import com.example.openticket.entity.HomepageSessionLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * 負責與數據庫中 HomepageSessionLog 表進行交互
 */
@Repository
public interface HomepageSessionLogRepository extends JpaRepository<HomepageSessionLog, Long> {

    // 這裡可以添加自定義查詢方法，例如:
    // List<HomepageSessionLog> findBySessionId(String sessionId);
}