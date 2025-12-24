# OpenTicket - 票務平台專案

OpenTicket 是一個全方位的線上票務平台，提供用戶瀏覽活動、購買票券、管理會員資訊等功能。本專案採用前後端分離架構，結合了現代化的開發技術。

## 👨‍💻 我的貢獻

在本项目中，我主要負責 **會員系統核心模組** 與 **個人化工具** 的開發，包含以下功能：

### 1. 安全身分驗證系統
*   **JWT 與 HttpOnly Cookie**：實作安全的身分驗證機制。後端將生成的 **JWT (JSON Web Token)** 存放於 **HttpOnly Cookie** 中，確保前端腳本無法讀取，有效防止 XSS 攻擊。
*   **無感驗證**：網站僅需檢查 Cookie 即可獲取帳號狀態，避免敏感身分資訊暴露於前端，提升安全性。
*   **多種登入方式**：實作一般帳號密碼登入及 **Google OAuth 2.0 第三方登入**。
*   **安全加密**：密碼採用 **BCrypt** 強度加密儲存，確保資料安全。

### 2. 會員服務與驗證
*   **信箱驗證服務**：整合 **Spring Boot Mail** 服務，實作註冊驗證碼與密碼重置功能。
*   **Redis 高效驗證**：利用 Redis 儲存與驗證暫時性的驗證碼（Verification Code），確保驗證過程的高效與安全性。

### 3. 個人中心與工具
*   **個人資料管理**：用戶可查看並修改基本資料，搭配響應式側邊欄（MemberSidebar）進行操作。
*   **活動行事曆 (Calendar)**：開發個人化行事曆功能，讓用戶直觀地查看已購票或感興趣的活動日期。
*   **收藏功能 (WishList)**：用戶可將感興趣的活動加入收藏清單，隨時追蹤。
*   **歷史紀錄**：串接訂單系統，讓用戶查看所有購票紀錄，並整合 **QRCode** 顯示功能供現場驗證。

---

## 🛠️ 技術棧

### 前端 (Frontend)
*   **框架**: React 18
*   **建構工具**: Vite
*   **路由**: React Router DOM
*   **樣式**: Tailwind CSS, PostCSS
*   **第三方登入**: @react-oauth/google
*   **功能組件**: React Icons, Lucide React, Date-fns

### 後端 (Backend)
*   **框架**: Spring Boot 3.5.7
*   **語言**: Java 17
*   **資料庫**: MySQL (配合 Spring Data JPA)
*   **快取**: Redis
*   **安全性**: Spring Security, JWT (jjwt)
*   **API 文件**: SpringDoc OpenAPI (Swagger)

## 🚀 快速開始

### 前端啟動
```bash
cd otfrontend
npm install
npm run dev
```

### 後端啟動
1. 確保已安裝 JDK 17 與 MySQL。
2. 配置 `backend/src/main/resources/application.properties`。
3. 執行 Maven 指令：
```bash
cd backend
./mvnw spring-boot:run
```

---
*本專案持續開發中，旨在提供最優質的購票體驗。*
