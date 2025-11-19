// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db'); // 導入我們建立的資料庫連線池

const app = express();
const PORT = process.env.PORT || 5000;

// --- 1. Middleware 設定 ---
app.use(cors()); 
app.use(express.json()); // 用來解析 JSON 格式的請求主體

// --- 2. 測試資料庫連線 (可選，但推薦) ---
db.getConnection()
    .then(connection => {
        console.log('MySQL/MAMP 連線成功');
        connection.release(); 
    })
    .catch(err => {
        console.error('MySQL/MAMP 連線失敗，請檢查 MAMP 狀態與設定:', err.message);
        process.exit(1); 
    });


// --- 3. API 路由定義 (Endpoint) ---

// [GET] /api/announcements: 獲取公告 (可選 limit 參數)
app.get('/api/announcements', async (req, res) => {
    try {
        const limitStr = req.query.limit; 
        
        let sql = 'SELECT id, title, content, created_at FROM announcement ORDER BY id DESC';
        
        // 1. 強制確保 limit 是一個有效的正整數
        const limit = parseInt(limitStr);
        
        if (!isNaN(limit) && limit > 0) {
            // ❗ 關鍵修正：確保 limit 是一個純淨的數字後再拼接
            // 這是您目前環境唯一可行的做法
            sql += ` LIMIT ${limit}`; 
            
            // ❗ 移除所有 console.log 避免影響效能和後端崩潰
        }
        
        const [rows] = await db.execute(sql);
        
        res.status(200).json(rows); 
    } catch (err) {
        // ❗ 處理錯誤：將後端錯誤打印出來，幫助我們除錯
        console.error('API 獲取公告失敗:', err.message); 
        // 移除原始錯誤訊息，避免將敏感資訊傳回前端
        res.status(500).json({ message: '伺服器內部錯誤，無法載入公告。' });
    }
});
// [GET] /api/events: 獲取所有活動，最新活動優先
app.get('/api/events', async (req, res) => {
    // 確保 db 變數（MySQL 連線）可用
    if (typeof db === 'undefined') {
        console.error('Database connection (db) is not defined.');
        return res.status(500).json({ message: '伺服器內部錯誤：資料庫連線未初始化。' });
    }

    try {
        // 抓取所有必要的欄位，並依照開始日期降序排列
        const sql = `
            SELECT 
                event_id, 
                event_title, 
                event_image, 
                event_start_date, 
                event_place,
                ticket_types
            FROM 
                event
            ORDER BY 
                event_start_date DESC
            LIMIT 10 
        `; // 限制抓取 10 個活動用於首頁輪播

        // 執行查詢
        const [rows] = await db.execute(sql);
        
        // 成功回傳資料
        res.status(200).json(rows); 
    } catch (err) {
        console.error('API 獲取活動列表失敗:', err.message);
        res.status(500).json({ message: '伺服器內部錯誤，無法載入活動列表。' });
    }
});


// --- 4. 啟動伺服器 ---
app.listen(PORT, () => {
    console.log(`MySQL API 伺服器運行在 http://localhost:${PORT}`);
});