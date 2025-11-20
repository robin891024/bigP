import { useState, useEffect } from "react"
import "../Css/Login.css"
import { useNavigate, Link, useLocation } from "react-router-dom"
import GoogleLoginButton from "./GoogleLogin"

function Login() {
    const navigate = useNavigate()
    const location = useLocation()

    const [account, setAccount] = useState("")
    const [password, setPassword] = useState("")
    const [message, setMessage] = useState("")

    // 檢查是否因為 token 過期而被導向登入頁面
    useEffect(() => {
        if (location.state?.expired) {
            setMessage("登入憑證已過期，請重新登入")
            // 清除 state 避免重新整理時再次顯示
            window.history.replaceState({}, document.title)
        }
    }, [location])

    const handleSubmit = async (e) => {
        e.preventDefault() // 防止表單重新整理

        try {
            const res = await fetch("http://localhost:8080/member/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: new URLSearchParams({
                    account: account,
                    password: password
                }),
                credentials: "include"
            })

            const data = await res.json()
            
            if (data.success) {
                setMessage("登入成功！")
                setTimeout(() => {
                    navigate("/member");
                }, 500);
            } else {
                alert(data.message || "帳號或密碼錯誤")
            }
        } catch (error) {
            alert("連線失敗，請稍後再試")
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <h1>登入</h1>
            <label>帳號</label>
            <input
                type="text"
                id="account"
                value={account}
                onChange={(e) => setAccount(e.target.value)}
            />
            <br />
            <label>密碼</label>
            <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <br />

            <input type="submit" value="登入" />
            <hr />
            <div style={{ marginTop: '20px' }}>
                <GoogleLoginButton />
            </div>
            <p>{message}</p>
            <hr />
            <p>還沒有帳號？<Link to="/register">立即註冊</Link></p>
        </form>
    )

}

export default Login