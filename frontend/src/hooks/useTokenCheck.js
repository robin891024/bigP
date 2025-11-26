import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * 定期檢查 JWT token 是否過期的 Hook
 * @param {number} intervalMinutes - 檢查間隔（分鐘），預設 5 分鐘
 */
export const useTokenCheck = (intervalMinutes = 5) => {
    const navigate = useNavigate();

    const checkToken = useCallback(async () => {
        try {
            const response = await fetch('http://localhost:8080/member/verify', {
                credentials: 'include'
            });
            
            const data = await response.json();
            
            // 如果 token 無效或過期
            if (!data.authenticated) {
                // 跳轉到登入頁面並顯示過期訊息
                navigate('/login', { state: { expired: true } });
            }
        } catch (error) {
            console.error('Token 檢查失敗:', error);
        }
    }, [navigate]);

    useEffect(() => {
        // 立即執行一次檢查
        checkToken();

        // 設定定期檢查
        const intervalMs = intervalMinutes * 60 * 1000; // 轉換為毫秒
        const intervalId = setInterval(checkToken, intervalMs);

        // 清理函數
        return () => {
            clearInterval(intervalId);
        };
    }, [checkToken, intervalMinutes]);

    return { checkToken };
};