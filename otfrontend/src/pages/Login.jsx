import { useState, useEffect } from "react"
import "../Css/Login.css"
import { useNavigate, Link, useLocation } from "react-router-dom"
import GoogleLoginButton from "./GoogleLogin"
import { useDarkMode } from "../hooks/useDarkMode"

function Login() {
    const navigate = useNavigate()
    const location = useLocation()

    const [account, setAccount] = useState("")
    const [password, setPassword] = useState("")
    const [message, setMessage] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [carouselItems, setCarouselItems] = useState([
        { loading: true },
        { loading: true },
        { loading: true }
    ])
    const [currentSlide, setCurrentSlide] = useState(0)
    const [isDark, toggleDarkMode] = useDarkMode()

    // 取得隨機活動作為輪播內容
    useEffect(() => {
        fetch("/api/events")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    const randomEvents = data
                        .sort(() => Math.random() - 0.5)
                        .slice(0, 5)
                        .map(event => ({
                            image: (event.image || "/api/images/covers/test.jpg").replace(/ /g, '%20'),
                            title: event.title,
                            description: event.address || "精彩活動，不容錯過",
                            loading: false
                        }));
                    setCarouselItems(randomEvents);
                }
            })
            .catch(err => {
                console.error("無法載入登入頁輪播圖片", err);
                // 失敗時顯示預設內容
                setCarouselItems([
                    {
                        image: "https://images.unsplash.com/photo-1557683316-973673baf926?w=800&h=600&fit=crop",
                        title: "展示產品特色",
                        description: "用引人注目的視覺效果吸引用戶，展示您的應用程式所提供的功能。",
                        loading: false
                    }
                ]);
            });
    }, []);

    // 檢查是否因為 token 過期而被導向登入頁面
    useEffect(() => {
        if (location.state?.expired) {
            setMessage("登入憑證已過期，請重新登入")
            // 清除 state 避免重新整理時再次顯示
            window.history.replaceState({}, document.title)
        }
    }, [location])

    // 輪播功能
    useEffect(() => {
        if (carouselItems.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % carouselItems.length)
        }, 5000)
        return () => clearInterval(timer)
    }, [carouselItems.length])

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            const response = await fetch(`http://localhost:8080/member/checkAc?account=${account}`);
            if (!response.ok) throw new Error("伺服器回應錯誤");

            const isExist = await response.json();
            if (!isExist) {
                setMessage("帳號或密碼錯誤")
                return
            }
        } catch (err) {
            setMessage("連線失敗，請稍後再試")
            return
        }

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
                    if (data.role == "user") {
                        const redirectPath = location.state?.redirect || '/member';
                        navigate(redirectPath);
                    } else if (data.role == "admin") {
                        window.location.href = "http://localhost:8081/organizer/dashboard";
                    } else if (data.role == "developer") {
                        window.location.href = "http://localhost:8081/admin/dashboard";
                    } else {
                        console.log("error");
                    }
                }, 500);
            } else {
                setMessage(data.message || "帳號或密碼錯誤")
            }
        } catch (error) {
            setMessage("連線失敗，請稍後再試")
        }
    }

    return (
        <>
            <button
                className="dark-mode-toggle"
                onClick={toggleDarkMode}
                aria-label="切換深色模式"
            >
                <span className="material-symbols-outlined">
                    {isDark ? "light_mode" : "dark_mode"}
                </span>
            </button>
            <div className="login-page">
                {/* 深色模式切換按鈕 */}


                <div className="login-container">
                    {/* 左側輪播區 */}
                    <div className="carousel-section">
                        <div className="carousel-wrapper">
                            <div className="carousel-track" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                                {carouselItems.map((item, index) => (
                                    <div key={index} className="carousel-item">
                                        <div className="carousel-card">
                                            <div
                                                className={`carousel-image ${item.loading ? 'skeleton loading' : ''}`}
                                                style={item.loading ? {} : { backgroundImage: `url(${item.image})` }}
                                            />
                                            <div className="carousel-content">
                                                {item.loading ? (
                                                    <>
                                                        <div className="skeleton skeleton-text skeleton-title" />
                                                        <div className="skeleton skeleton-text skeleton-desc" />
                                                    </>
                                                ) : (
                                                    <>
                                                        <h3>{item.title}</h3>
                                                        <p>{item.description}</p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="carousel-indicators">
                            {carouselItems.map((_, index) => (
                                <span
                                    key={index}
                                    className={`indicator ${index === currentSlide ? 'active' : ''}`}
                                    onClick={() => setCurrentSlide(index)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* 右側登入表單 */}
                    <div className="form-section">
                        <div className="form-wrapper">
                            {message && <div className="message">{message}</div>}
                            <form onSubmit={handleSubmit}>
                                <h1>登入</h1>
                                <div className="form-group">
                                    <label htmlFor="account">帳號</label>
                                    <input
                                        type="text"
                                        id="account"
                                        placeholder="Enter your account"
                                        value={account}
                                        onChange={(e) => setAccount(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="password">密碼</label>
                                    <div className="password-input-wrapper">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            id="password"
                                            placeholder="Enter your password"
                                            value={password}
                                            autoComplete="off"
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="toggle-password"
                                            onClick={() => setShowPassword(!showPassword)}
                                            aria-label={showPassword ? "隱藏密碼" : "顯示密碼"}
                                        >
                                            <span className="material-symbols-outlined">
                                                {showPassword ? "visibility_off" : "visibility"}
                                            </span>
                                        </button>
                                    </div>
                                </div>

                                <button type="submit" className="btn-primary">
                                    登入
                                </button>

                                <div className="divider">
                                    <hr />
                                </div>

                                <div className="google-login-wrapper">
                                    <GoogleLoginButton />
                                </div>

                                <div className="divider">
                                    <hr />
                                </div>

                                <p className="register-link">
                                    還沒有帳號嗎？
                                    <Link to="/register">點此註冊</Link>
                                </p>

                                <p className="back-home">
                                    <Link to="/">回到首頁</Link>
                                </p>    
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>

    )
}

export default Login