import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// --- 配置常數 ---
const BASE_URL = 'http://localhost:8080';
// -----------------

// *** 實際後端 API 呼叫的函式 (使用 fetch) ***
const actualApi = {
    /**
     * 處理標準帳號密碼登入。
     * @param {string} account - 會員帳號
     * @param {string} password - 密碼
     * @returns {Promise<{success: boolean, name?: string, message?: string}>} 
     */
    login: async (account, password) => {
        // 後端端點：http://localhost:8080/member/login
        const url = `${BASE_URL}/member/login`; 

        try {
            const res = await fetch(url, {
                method: "POST",
                headers: {
                    // *** 根據您的前端範例，使用 form-urlencoded ***
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: new URLSearchParams({
                    // 根據後端要求，使用 account 和 password 作為鍵名
                    account: account,
                    password: password
                }),
                // 必須包含 credentials: "include" 才能發送和接收跨域 Cookie
                credentials: "include" 
            });

            // 登入成功時，後端會將 JWT 設置到 cookie 中，並返回 JSON 成功訊息
            const data = await res.json();
            
            // 檢查 HTTP 狀態碼 (200-299 視為成功)
            if (res.ok) {
                // *** 根據常見 Spring Security 登入成功邏輯：
                // 1. JWT 已自動在 Header (Set-Cookie) 中設置完成
                // 2. 登入成功響應中通常會返回用戶名
                
                // 假設成功響應中的用戶名鍵名為 'name'
                const userName = data.name || data.user?.name || '會員'; 

                return { 
                    success: true, 
                    name: userName,
                    message: data.message || '登入成功'
                };
            } else {
                // 處理非 2xx 的響應，例如 401 Unauthorized
                const errorMessage = data.message || `Login failed with status: ${res.status}`;
                return { success: false, message: errorMessage };
            }

        } catch (error) {
            console.error('Login API error:', error);
            return { success: false, message: '網路或伺服器連線錯誤' };
        }
    },
    
    /**
  * 獲取會員名稱 (用於驗證 Token 有效性，需依賴 Cookie 自動發送)
  * @returns {Promise<{success: boolean, name?: string, message?: string}>} 
  */
    getProfile: async () => {
        // 注意：您 MemberInfo.jsx 中使用的是 /member/profile
        const url = `${BASE_URL}/member/profile`; 
            
        try {
        const res = await fetch(url, {
            method: 'GET',
            credentials: "include" 
        });

                // ** 核心邏輯修改：處理 401/403 **
                if (!res.ok) {
                    // 如果不是 2xx，直接返回失敗，讓 useAuth 的 useEffect 處理狀態
                    const status = res.status;
                    let message = `驗證失敗，狀態碼: ${status}`;
                    try {
                        // 嘗試讀取後端錯誤訊息 (如果後端有返回 JSON)
                        const errorData = await res.json(); 
                        message = errorData.message || message;
                    } catch (e) {
                        // 如果後端返回非 JSON 格式 (例如 401 默認響應)
                        console.warn(`Profile API returned ${status} without readable JSON.`);
                    }
                    
                    return { 
                        success: false, 
                        message: message 
                    };
                }

                // ** 處理成功 (res.ok) **
                const data = await res.json();
                // 這裡直接使用 data.name，因為 MemberInfo 顯示的後端數據結構就是這樣。
                const userName = data.name || '會員'; 

                return { 
                    success: true, 
                    name: userName,
                    message: 'Token 驗證成功' 
                };
                

        } catch (error) {
        console.error('Profile API 網路錯誤:', error);
        return { success: false, message: '網路連線或伺服器錯誤' };
        }
    },

    /**
     * 登出 (清除 JWT Cookie)
     */
    logout: async () => {
        // 假設登出端點為 /member/logout (一個會清除 Cookie 的端點)
        // ★ 如果您有實際的 Logout API，請替換此處
        const url = `${BASE_URL}/member/logout`; 
        
        try {
            // 發送請求，讓後端清除 JWT Cookie
            await fetch(url, {
                method: 'POST', // 登出通常使用 POST
                credentials: "include"
            });
            // 即使請求失敗，前端也應該清除本地狀態
        } catch (e) {
            console.warn("Logout API request failed, proceeding with frontend logout.", e);
        }
    }
};
// ***************************************************************

/**
 * 處理會員認證狀態、登入/登出邏輯和 Token 持久化的 Custom Hook。
 * ★ 專為 JWT Cookie 認證機制設計
 */
export const useAuth = () => {
    // 狀態管理
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userName, setUserName] = useState("");
    const navigate = useNavigate();
    // 由於 JWT 是存在 HttpOnly Cookie 中 (前端無法讀取)，
    // 我們無法直接依賴 authToken 狀態。
    // 我們改為依賴 isLoggedIn 狀態，並在載入時調用 getProfile 來驗證 Cookie。
    const [isLoading, setIsLoading] = useState(true);
    // 1. 登入函式：呼叫 API 並讓後端設置 Cookie
    const login = useCallback(async (account, password) => {
        const result = await actualApi.login(account, password);
        
        if (result.success) {
            // 登入成功後，JWT Cookie 已由後端設置。
            // 由於我們無法直接讀取 Cookie，所以需要立即更新本地狀態。
            setUserName(result.name);
            setIsLoggedIn(true);
            return { success: true };

        } else {
            console.error('Login failed:', result.message);
            return { success: false, error: result.message };
        }
    }, []);

    // 2. 登出函式：清除後端 Cookie 和本地狀態
    const logout = useCallback(async () => {
        try {
            const res = await fetch("http://localhost:8080/member/logout", {
                method: "POST",
                credentials: "include"
            });

            // 無論結果如何，都清除本地狀態
            setUserName("");
            setIsLoggedIn(false);

            // 如果後端返回 403/401，視為 Token 過期，導航並帶上狀態
            if (res.status === 403 || res.status === 401) {
                navigate("/login", { state: { expired: true } });
                return;
            }

            // 登出成功或發生其他錯誤，導航到登入頁面
            if (res.ok) {
                // 如果後端成功，導航到首頁或登入頁
                navigate("/"); 
            } else {
                // 處理非 2xx 響應
                console.error('Logout API failed with status:', res.status);
                navigate("/"); 
            }

        } catch (error) {
            console.error('Logout API 網路錯誤:', error);
            // 發生網路錯誤時，導航到登入頁面
            setUserName("");
            setIsLoggedIn(false);
            navigate("/login");
        }
    }, [navigate]); // 確保依賴 navigate

    // 3. 檢查持久化狀態 (元件首次載入時驗證 JWT Cookie 的有效性)
    useEffect(() => {
        const checkLoginStatus = async () => {
            // 嘗試呼叫一個受保護的 API (例如 /member/info)
            // 瀏覽器會自動帶上 JWT Cookie
            setIsLoading(true);
            const result = await actualApi.getProfile();

            if (result.success) {
                // Cookie 有效，且成功返回用戶名
                setUserName(result.name);
                setIsLoggedIn(true);
            } else {
                // Cookie 無效、過期或不存在
                // 注意：這裡不需要呼叫 logout，因為 Cookie 已經失效，只需確保本地狀態為登出
                setUserName("");
                setIsLoggedIn(false);
            }
            setIsLoading(false);
        };
        
        // 只有在元件首次載入時運行一次
        checkLoginStatus();

    }, []); 


    return { isLoggedIn, userName, login, logout, isLoading };
};