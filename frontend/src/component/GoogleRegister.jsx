import { useEffect, useState } from "react"
import "../Css/Register.css"
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDarkMode } from "../hooks/useDarkMode"

function GoogleRegister() {
    const locationdata = useLocation();
    const navigate = useNavigate();

    const registerToken = locationdata.state?.registerToken;
    const [account, setAccount] = useState("");
    const [Cname, setCName] = useState("");

    useEffect(() => {
        if (!registerToken) {
            navigate("/login");
            return;
        }

        const getLoginData = async () => {
            try {
                const res = await fetch("http://localhost:8080/oauth2/google/register-data", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ token: registerToken })
                })

                const data = await res.json();

                if (data.success) {
                    setAccount(data.email);
                    setCName(data.name);
                } else {
                    alert("Google 登入資料已過期，請重新登入");
                    navigate("/login");
                }
            } catch (err) {
                alert("無法連線伺服器");
            }

        };
        getLoginData();
    }, [navigate, registerToken]);

    const [password, setPassword] = useState("");
    const [location, setLocation] = useState("");
    const [alertMsg, setAlertMsg] = useState("");
    const [alertType, setAlertType] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isDark, toggleDarkMode] = useDarkMode();

    const showAlert = (message, type) => {
        setAlertMsg(message);
        setAlertType(type);
        setTimeout(() => {
            setAlertMsg("");
        }, 3000)
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!password || !location) {
            showAlert("⚠️ 請完整填寫資料", "error");
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/oauth2/google/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token: registerToken,
                    password,
                    city: location || ""
                }),
            });

            if (!response.ok) throw new Error("伺服器回應錯誤");

            const data = await response.json();

            if (data.success) {
                showAlert("🎉 google註冊成功！", "success");
                setPassword("");
                setLocation("");

                setTimeout(() => {
                    navigate("/member");
                }, 2000)
            } else {
                showAlert("❌ 註冊失敗！", "error");
            }
        } catch (err) {
            showAlert("❌ 無法連線到伺服器", "error");
        }
    };

    const cities = [
        "台北市", "新北市", "桃園市", "台中市", "台南市", "高雄市",
        "基隆市", "新竹市", "新竹縣", "苗栗縣", "彰化縣", "南投縣",
        "雲林縣", "嘉義市", "嘉義縣", "屏東縣", "宜蘭縣", "花蓮縣",
        "台東縣", "澎湖縣", "金門縣", "連江縣"
    ];

    return (
        <>
            {alertMsg && (
                <div className={`alert-bar ${alertType}`}>
                    {alertMsg}
                </div>
            )}

            <div className="register-page">
                {/* 深色模式切換按鈕 */}
                <button
                    className="dark-mode-toggle"
                    onClick={toggleDarkMode}
                    aria-label="切換深色模式"
                >
                    <span className="material-symbols-outlined">
                        {isDark ? "light_mode" : "dark_mode"}
                    </span>
                </button>

                <div className="register-container">
                    <div className="register-card">
                        <div className="register-header">
                            <h1>註冊</h1>
                            <p className="subtitle">建立您的新帳戶</p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="email">帳號</label>
                                <div className="email-input-group">
                                    {account}
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="password">密碼</label>
                                <div className="password-input-wrapper">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        autoComplete="off"
                                        placeholder="請輸入您的密碼"
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

                            <div className="form-group">
                                <label htmlFor="name">姓名</label>
                                {Cname}
                            </div>

                            <div className="form-group">
                                <label htmlFor="location">居住地</label>
                                <select
                                    id="location"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="location-select"
                                    required
                                >
                                    <option value="">請選擇您的居住地</option>
                                    {cities.map((city) => (
                                        <option key={city} value={city}>
                                            {city}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button type="submit" className="btn-primary">
                                註冊
                            </button>

                            <p className="login-link">
                                已經有帳戶了？
                                <Link to="/login">登入</Link>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}

export default GoogleRegister;