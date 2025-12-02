# Backend Setup

## 環境設定

### 1. 複製設定檔範本

```bash
cd backend/src/main/resources
cp application.properties.example application.properties
```

### 2. 修改 application.properties

編輯 `application.properties` 並填入您的實際設定：

#### 資料庫設定
```properties
spring.datasource.url=jdbc:mysql://YOUR_HOST:3306/YOUR_DATABASE
spring.datasource.username=YOUR_USERNAME
spring.datasource.password=YOUR_PASSWORD
```

#### JWT 設定
```properties
jwt.secret=YOUR_JWT_SECRET_KEY_AT_LEAST_32_CHARACTERS
```

#### Google OAuth2 設定
1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 建立 OAuth 2.0 憑證
3. 填入 Client ID 和 Client Secret

```properties
spring.security.oauth2.client.registration.google.client-id=YOUR_GOOGLE_CLIENT_ID
spring.security.oauth2.client.registration.google.client-secret=YOUR_GOOGLE_CLIENT_SECRET
```

## 執行專案

```bash
mvn spring-boot:run
```

## 注意事項

⚠️ **重要：** `application.properties` 包含敏感資訊，已加入 `.gitignore`，請勿提交到 Git！