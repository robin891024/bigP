import { useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid'; 

// --- 配置常數 ---
// 定義 Session 儲存在 sessionStorage 的鍵名
const SESSION_KEY = 'homepage_session';
// Session 有效期限：3 分鐘 = 180,000 毫秒
const SESSION_DURATION_MS = 3 * 60 * 1000;
// 後端 API 端點 (請根據您的 Spring Boot 服務地址配置)
const TRACKING_API_URL = 'http://localhost:8080/api/log/session'; 
// -----------------

/**
 * 檢查並管理前端 Session 的 Custom Hook。
 * 1. 檢查 sessionStorage 中現有 Session 的有效性 (3分鐘)。
 * 2. 如果 Session 無效或不存在，生成新的 Session ID 和 timeStamp。
 * 3. 呼叫後端 API 傳輸 Session ID，同時防止在 React 嚴格模式下雙重發送。
 * 4. 記錄本次訪問的計數和時間長度。
 * * @param {string} currentPage - 當前頁面的標識，例如 'homepage'
 */
const useSessionTracker = (currentPage = 'homepage') => {
    // 使用 useRef 來確保 API 呼叫邏輯只在元件首次掛載時運行一次
    const hasRun = useRef(false);

    // --- 後端 API 呼叫函式 ---
    const sendSessionLog = async (sessionId) => {
        try {
            const response = await fetch(TRACKING_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    sessionId: sessionId,
                    page: currentPage, 
                }),
                credentials: "include",
            });

            if (!response.ok) {
                console.error(`[SessionTracker] Failed to log session to backend: ${response.status} ${response.statusText}`);
            } else {
                console.log(`[SessionTracker] Successfully logged session ID: ${sessionId} to backend.`);
            }
        } catch (error) {
            console.error('[SessionTracker] Error sending session log:', error);
        }
    };
    // ----------------------------

    useEffect(() => {
        // --- 嚴格模式鎖定檢查 ---
        if (hasRun.current) {
            // 如果已經運行過，則直接退出，避免雙重執行
            return; 
        }
        
        // 設置旗標為 true，確保之後不會再運行
        hasRun.current = true;
        // ------------------------

        let currentSessionId;
        let newSession = false;

        // --- 1. 檢查現有 Session ---
        const storedData = sessionStorage.getItem(SESSION_KEY);
        const now = Date.now();
        let updatedData = {};

        if (storedData) {
            const parsedData = JSON.parse(storedData);
            
            // 判斷 Session 是否過期: (當前時間 - Session 創建時間) < 有效期
            if (now - parsedData.sessionStartTime < SESSION_DURATION_MS) {
                // Session 仍在有效期內
                currentSessionId = parsedData.sessionId;
                
                // 更新訪問次數和時間長度 (使用現有 Session)
                const totalDuration = now - parsedData.sessionStartTime; 
                
                updatedData = {
                    ...parsedData,
                    visitCount: parsedData.visitCount + 1, // 訪問次數 +1
                    lastVisitTime: now,
                };

                console.log(`[SessionTracker] Existing valid session: ${currentSessionId}. Visits: ${updatedData.visitCount}, Duration: ${Math.round(totalDuration / 1000)}s`);

            } else {
                // Session 已過期
                newSession = true;
                console.log(`[SessionTracker] Session expired (over 3 mins). Creating new one.`);
            }
        } else {
            // 沒有 Session 記錄
            newSession = true;
            console.log(`[SessionTracker] No session found. Creating new one.`);
        }

        // --- 2. 生成新 Session ---
        if (newSession) {
            // 生成新的 Session ID
            currentSessionId = uuidv4(); 
            
            updatedData = {
                sessionId: currentSessionId,
                sessionStartTime: now, // 記錄 Session 創建時間
                visitCount: 1, // 第一次訪問
                lastVisitTime: now,
            };
        }
        
        // --- 3. 儲存/更新 sessionStorage ---
        if (currentSessionId) {
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(updatedData));
            
            // --- 4. 呼叫後端 API 傳輸 Session ID ---
            // 只有當 Session ID 確定且為首次運行時才發送
            sendSessionLog(currentSessionId);
        }

    }, [currentPage]); 
    // 雖然使用了 useRef 鎖定，但我們仍然將 currentPage 放在依賴項中以遵循 React 規則。

    // Custom Hook 不返回任何 React 元素
};

export default useSessionTracker;