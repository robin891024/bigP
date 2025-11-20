import { useEffect, useState } from "react"
import { Navigate } from "react-router-dom";


function ProtectedRoute ({children}) {
    const [authState, setAuthState] = useState({ loading: true, authenticated: false, hasToken: false });

    useEffect(() => {
        // 檢查是否有 JWT cookie（簡單檢查 document.cookie）
        const hasJwtCookie = document.cookie.split(';').some(cookie => cookie.trim().startsWith('jwt='));
        
        fetch("http://localhost:8080/member/verify", {
            credentials : "include"
        })
        .then(res => res.json())
        .then(data => {
            setAuthState({
                loading: false,
                authenticated: data.authenticated,
                hasToken: hasJwtCookie
            });
        })
        .catch(() => {
            setAuthState({
                loading: false,
                authenticated: false,
                hasToken: hasJwtCookie
            });
        });
    }, [])

    if (authState.loading) {
        return <div>載入中...</div>;
    }

    if (!authState.authenticated) {
        // 如果有 token 但驗證失敗，表示 token 過期
        // 如果沒有 token，表示未登入，不顯示過期訊息
        const expired = authState.hasToken;
        return <Navigate to="/login" state={{ expired }} replace/>
    }

    return children;
}

export default ProtectedRoute