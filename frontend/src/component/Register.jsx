import { useState } from "react"
import "../Css/Register.css"
import { Link, useNavigate } from "react-router-dom";
import { useDarkMode } from "../hooks/useDarkMode"

function Register() {
    const navigate = useNavigate()

    const [email_f, setEmail_f] = useState("");
    const [email_b, setEmail_b] = useState("");
    const [password, setPassword] = useState("");
    const [checkMessage, setCheckMessage] = useState("");
    const [cname, setCname] = useState("");
    const [location, setLocation] = useState("");
    const [tel, setTel] = useState("");
    const [alertMsg, setAlertMsg] = useState("");
    const [alertType, setAlertType] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isDark, toggleDarkMode] = useDarkMode();
    
    // 驗證錯誤訊息狀態
    const [emailFError, setEmailFError] = useState("");
    const [emailBError, setEmailBError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [telError, setTelError] = useState("");
    const [nameError, setNameError] = useState("");

    const showAlert = (message, type) => {
        setAlertMsg(message);
        setAlertType(type);
        setTimeout(() => {
            setAlertMsg("");
        }, 3000)
    }

    // 驗證帳號前綴（只能有 . 和大小寫英文跟數字）
    const validateEmailPrefix = (value) => {
        const regex = /^[a-zA-Z0-9.]+$/;
        if (!value) {
            setEmailFError("請輸入帳號");
            return false;
        }
        if (!regex.test(value)) {
            setEmailFError("帳號只能包含英文字母、數字和點(.)");
            return false;
        }
        setEmailFError("");
        return true;
    };

    // 驗證信箱網域
    const validateEmailDomain = (value) => {
        const regex = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!value) {
            setEmailBError("請輸入信箱網域");
            return false;
        }
        if (!regex.test(value)) {
            setEmailBError("請輸入有效的信箱網域（例如：gmail.com）");
            return false;
        }
        setEmailBError("");
        return true;
    };

    // 驗證密碼（只能有大小寫英數字且長度需在6~20字之間）
    const validatePassword = (value) => {
        const regex = /^[a-zA-Z0-9]{6,20}$/;
        if (!value) {
            setPasswordError("請輸入密碼");
            return false;
        }
        if (!regex.test(value)) {
            if (value.length < 6 || value.length > 20) {
                setPasswordError("密碼長度必須在6~20字之間");
            } else {
                setPasswordError("密碼只能包含英文字母和數字");
            }
            return false;
        }
        setPasswordError("");
        return true;
    };

    // 驗證台灣電話號碼
    const validateTel = (value) => {
        // 支援市話（02-12345678、04-12345678等）和手機（09xx-xxxxxx 或 09xxxxxxxx）
        const regex = /^(0\d{1,2}-?\d{7,8}|09\d{2}-?\d{6})$/;
        if (!value) {
            setTelError("請輸入電話號碼");
            return false;
        }
        if (!regex.test(value)) {
            setTelError("請輸入有效的台灣電話號碼（例如：02-12345678 或 0912-345678）");
            return false;
        }
        setTelError("");
        return true;
    };

    // 驗證姓名（不能包含特殊字元，防止 SQL 注入等安全問題）
    const validateName = (value) => {
        const regex = /^[a-zA-Z\u4e00-\u9fa5\s]+$/;
        if (!value) {
            setNameError("請輸入姓名");
            return false;
        }
        if (!regex.test(value)) {
            setNameError("姓名只能包含中文、英文字母和空格");
            return false;
        }
        if (value.length > 50) {
            setNameError("姓名長度不能超過50個字元");
            return false;
        }
        setNameError("");
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 執行所有驗證
        const isEmailFValid = validateEmailPrefix(email_f);
        const isEmailBValid = validateEmailDomain(email_b);
        const isPasswordValid = validatePassword(password);
        const isTelValid = validateTel(tel);
        const isNameValid = validateName(cname);

        if (!email_f || !email_b || !password || !cname || !location || !tel) {
            showAlert("⚠️ 請完整填寫資料", "error");
            return;
        }

        // 如果任何驗證失敗，不提交表單
        if (!isEmailFValid || !isEmailBValid || !isPasswordValid || !isTelValid || !isNameValid) {
            showAlert("⚠️ 請修正表單錯誤後再提交", "error");
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/member/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    account : email_f + "@" + email_b,
                    password,
                    name: cname,
                    city: location,
                    tel: tel
                }),
            });

            if (!response.ok) throw new Error("伺服器回應錯誤");

            const data = await response.json();

            if (data.success) {
                showAlert("🎉 註冊成功！即將跳轉到登入頁面...", "success");
                setEmail_f("");
                setEmail_b("");
                setPassword("");
                setCname("");
                setLocation("");
                setTel("");
                setCheckMessage("");

                setTimeout(() => {
                    navigate("/login");
                }, 2000)
            } else {
                showAlert("❌ 註冊失敗！", "error");
            }
        } catch (err) {
            showAlert("❌ 無法連線到伺服器", "error");
        }
    };

    const checkAc = async (e) => {
        e.preventDefault();

        if (!email_f.trim() || !email_b.trim()) {
            setCheckMessage("⚠️ 請輸入帳號");
            return;
        }

        try {
            const fullEmail = `${email_f}@${email_b}`
            const response = await fetch(`http://localhost:8080/member/checkAc?account=${fullEmail}`);
            if (!response.ok) throw new Error("伺服器回應錯誤");

            const isExist = await response.json();
            setCheckMessage(isExist ? "❌ 帳號已被使用" : "✅ 帳號可使用");
        } catch (err) {
            setCheckMessage("❌ 無法檢查帳號，請稍後再試");
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
                                    <input
                                        type="text"
                                        id="email_f"
                                        className="email-input-left"
                                        value={email_f}
                                        onBlur={(e) => {
                                            validateEmailPrefix(e.target.value);
                                            checkAc(e);
                                        }}
                                        onChange={(e) => {
                                            setEmail_f(e.target.value);
                                            if (emailFError) validateEmailPrefix(e.target.value);
                                        }}
                                        autoComplete="off"
                                        placeholder="使用者名稱"
                                        required
                                    />
                                    <span className="email-separator">@</span>
                                    <input
                                        type="text"
                                        id="email_b"
                                        className="email-input-right"
                                        value={email_b}
                                        onBlur={(e) => {
                                            validateEmailDomain(e.target.value);
                                            checkAc(e);
                                        }}
                                        onChange={(e) => {
                                            setEmail_b(e.target.value);
                                            if (emailBError) validateEmailDomain(e.target.value);
                                        }}
                                        autoComplete="off"
                                        placeholder="信箱網域"
                                        required
                                    />
                                </div>
                                {emailFError && (
                                    <div className="check-message error">
                                        {emailFError}
                                    </div>
                                )}
                                {emailBError && (
                                    <div className="check-message error">
                                        {emailBError}
                                    </div>
                                )}
                                {checkMessage && !emailFError && !emailBError && (
                                    <div className={`check-message ${checkMessage.includes('✅') ? 'success' : 'error'}`}>
                                        {checkMessage}
                                    </div>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="password">密碼</label>
                                <div className="password-input-wrapper">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        value={password}
                                        onBlur={(e) => validatePassword(e.target.value)}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            if (passwordError) validatePassword(e.target.value);
                                        }}
                                        autoComplete="off"
                                        placeholder="請輸入您的密碼（6-20位英數字）"
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
                                {passwordError && (
                                    <div className="check-message error">
                                        {passwordError}
                                    </div>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="name">姓名</label>
                                <input
                                    type="text"
                                    id="name"
                                    value={cname}
                                    onBlur={(e) => validateName(e.target.value)}
                                    onChange={(e) => {
                                        setCname(e.target.value);
                                        if (nameError) validateName(e.target.value);
                                    }}
                                    autoComplete="off"
                                    placeholder="請輸入您的姓名"
                                    required
                                />
                                {nameError && (
                                    <div className="check-message error">
                                        {nameError}
                                    </div>
                                )}
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

                            <div className="form-group">
                                <label htmlFor="tel">電話</label>
                                <input
                                    type="text"
                                    id="tel"
                                    value={tel}
                                    onBlur={(e) => validateTel(e.target.value)}
                                    onChange={(e) => {
                                        setTel(e.target.value);
                                        if (telError) validateTel(e.target.value);
                                    }}
                                    autoComplete="off"
                                    placeholder="請輸入您的電話（例如：02-12345678）"
                                    required
                                />
                                {telError && (
                                    <div className="check-message error">
                                        {telError}
                                    </div>
                                )}
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

export default Register