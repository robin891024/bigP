import { useState } from "react"
import "../Css/Register.css"
import { Link, useNavigate } from "react-router-dom";
import { useDarkMode } from "../hooks/useDarkMode"

function Register() {
    const navigate = useNavigate()
    const [isDark, toggleDarkMode] = useDarkMode();
    const [checkMessage, setCheckMessage] = useState("");

    // 驗證流程狀態 (1=填寫信箱, 2=輸入驗證碼, 3=填寫其他資料)
    const [verificationStep, setVerificationStep] = useState(1);

    // Token 相關
    const [verificationToken, setVerificationToken] = useState("");
    const [registrationToken, setRegistrationToken] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    const [countdown, setCountdown] = useState(0);
    const [verifiedEmail, setVerifiedEmail] = useState("");
    const [isLocked, setIsLocked] = useState(false);
    const [lockCountdown, setLockCountdown] = useState(0);

    // 表單欄位
    const [email_f, setEmail_f] = useState("");
    const [email_b, setEmail_b] = useState("");
    const [password, setPassword] = useState("");
    const [cname, setCname] = useState("");
    const [location, setLocation] = useState("");
    const [tel, setTel] = useState("");

    // UI 狀態
    const [alertMsg, setAlertMsg] = useState("");
    const [alertType, setAlertType] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // 驗證錯誤訊息
    const [emailFError, setEmailFError] = useState("");
    const [emailBError, setEmailBError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [telError, setTelError] = useState("");
    const [nameError, setNameError] = useState("");
    const [tokenExpiresAt, setTokenExpiresAt] = useState(null);
    const [registrationExpiresAt, setRegistrationExpiresAt] = useState(null);
    const [remainingAttempts, setRemainingAttempts] = useState(5);

    const showAlert = (message, type) => {
        setAlertMsg(message);
        setAlertType(type);
        setTimeout(() => setAlertMsg(""), 3000);
    }

    // 驗證函數
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

    const validateTel = (value) => {
        const regex = /^(0\d{1,2}-?\d{7,8}|09\d{2}-?\d{6})$/;
        if (!value) {
            setTelError("請輸入電話號碼");
            return false;
        }
        if (!regex.test(value)) {
            setTelError("請輸入有效的台灣電話號碼");
            return false;
        }
        setTelError("");
        return true;
    };

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

    // 步驟1: 發送驗證碼
    const sendVerificationCode = async () => {
        const fullEmail = `${email_f}@${email_b}`;

        if (!validateEmailPrefix(email_f) || !validateEmailDomain(email_b)) {
            showAlert("⚠️ 請輸入正確的信箱格式", "error");
            return;
        }
        
        setIsLoading(true);
        try {
            const response = await fetch("http://localhost:8080/member/send-verification-code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: fullEmail }),
            });
            const data = await response.json();
            if (data.success) {
                setVerificationToken(data.token);
                setVerificationStep(2);
                setCountdown(60);
                setRemainingAttempts(5);// 重置嘗試次數

                // 設定 Token 過期時間 (5分鐘後)
                const expiresAt = new Date(Date.now() + data.expiresIn * 1000);
                setTokenExpiresAt(expiresAt);

                showAlert("✅ 驗證碼已發送到您的信箱,請在 5 分鐘內完成驗證", "success");

                // 倒數計時
                const timer = setInterval(() => {
                    setCountdown(prev => {
                        if (prev <= 1) {
                            clearInterval(timer);
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
            } else {
                if (data.remainingSeconds) {
                    showAlert(`❌ ${data.message}`, "error");
                } else {
                    showAlert(`❌ ${data.message}`, "error");
                }
            }
        } catch (err) {
            showAlert("❌ 無法連線到伺服器", "error");
        } finally {
            setIsLoading(false);
        }
    };

    // 步驟2: 驗證驗證碼
    const verifyCode = async () => {
        if (verificationCode.length !== 6) {
            showAlert("⚠️ 請輸入6位數驗證碼", "error");
            return;
        }

        // 檢查 Token 是否過期
        if (tokenExpiresAt && new Date() > tokenExpiresAt) {
            showAlert("❌ 驗證碼已過期,請重新發送", "error");
            setVerificationStep(1);
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch("http://localhost:8080/member/verify-email-code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token: verificationToken,
                    code: verificationCode
                }),
            });

            const data = await response.json();

            if (data.success) {
                setRegistrationToken(data.registrationToken);
                setVerifiedEmail(data.email);
                setVerificationStep(3);
                // 設定註冊 Token 過期時間 (10分鐘後)
                const expiresAt = new Date(Date.now() + data.expiresIn * 1000);
                setRegistrationExpiresAt(expiresAt);

                showAlert("✅ 信箱驗證成功,請在 10 分鐘內完成註冊", "success");
            } else {
                // 檢查是否被鎖定
                if (data.locked) {
                    setIsLocked(true);
                    setLockCountdown(data.lockRemainingTime);
                    setRemainingAttempts(0);
                    showAlert(`❌ ${data.message}`, "error");
                    
                    // 開始鎖定倒數計時
                    const lockTimer = setInterval(() => {
                        setLockCountdown(prev => {
                            if (prev <= 1) {
                                clearInterval(lockTimer);
                                setIsLocked(false);
                                setRemainingAttempts(5);
                                showAlert("✅ 可以重新嘗試了,請重新發送驗證碼", "success");
                                return 0;
                            }
                            return prev - 1;
                        });
                    }, 1000);
                } else if (data.remainingAttempts !== undefined) {
                    setRemainingAttempts(data.remainingAttempts);
                    showAlert(`❌ ${data.message}`, "error");
                } else {
                    showAlert(`❌ ${data.message}`, "error");
                }
            }
        } catch (err) {
            showAlert("❌ 無法連線到伺服器", "error");
        } finally {
            setIsLoading(false);
        }
    };

    // 步驟3: 提交註冊
    const handleSubmit = async (e) => {
        e.preventDefault();

        // 檢查註冊 Token 是否過期
        if (registrationExpiresAt && new Date() > registrationExpiresAt) {
            showAlert("❌ 註冊時間已過期,請重新驗證信箱", "error");
            setVerificationStep(1);
            return;
        }

        const isPasswordValid = validatePassword(password);
        const isTelValid = validateTel(tel);
        const isNameValid = validateName(cname);

        if (!password || !cname || !location || !tel) {
            showAlert("⚠️ 請完整填寫資料", "error");
            return;
        }

        if (!isPasswordValid || !isTelValid || !isNameValid) {
            showAlert("⚠️ 請修正表單錯誤後再提交", "error");
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch("http://localhost:8080/member/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    registrationToken: registrationToken,
                    account: verifiedEmail,
                    password,
                    name: cname,
                    city: location,
                    tel: tel
                }),
            });

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
                setVerificationCode("");
                setVerificationToken("");
                setRegistrationToken("");
                setVerifiedEmail("");

                // 清空所有錯誤訊息
                setEmailFError("");
                setEmailBError("");
                setPasswordError("");
                setTelError("");
                setNameError("");

                // 重置步驟
                setVerificationStep(1);

                setTimeout(() => navigate("/login"), 2000);
            } else {
                showAlert(`❌ ${data.message}`, "error");
            }
        } catch (err) {
            showAlert("❌ 無法連線到伺服器", "error");
        } finally {
            setIsLoading(false);
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
                            <p className="subtitle">
                                {verificationStep === 1 && "步驟 1/3: 驗證信箱"}
                                {verificationStep === 2 && "步驟 2/3: 輸入驗證碼"}
                                {verificationStep === 3 && "步驟 3/3: 完成註冊"}
                            </p>
                        </div>

                        {/* 步驟指示器 */}
                        <div className="step-indicator">
                            <div className={`step ${verificationStep >= 1 ? 'active' : ''}`}>
                                <div className="step-number">1</div>
                                <div className="step-label">驗證信箱</div>
                            </div>
                            <div className={`step-line ${verificationStep >= 2 ? 'active' : ''}`}></div>
                            <div className={`step ${verificationStep >= 2 ? 'active' : ''}`}>
                                <div className="step-number">2</div>
                                <div className="step-label">輸入驗證碼</div>
                            </div>
                            <div className={`step-line ${verificationStep >= 3 ? 'active' : ''}`}></div>
                            <div className={`step ${verificationStep >= 3 ? 'active' : ''}`}>
                                <div className="step-number">3</div>
                                <div className="step-label">完成註冊</div>
                            </div>
                        </div>

                        {/* 步驟1: 輸入信箱 */}
                        {verificationStep === 1 && (
                            <div className="step-content">
                                <div className="form-group">
                                    <label htmlFor="email">信箱地址</label>
                                    <div className="email-input-group">
                                        <input
                                            type="text"
                                            className="email-input-left"
                                            value={email_f}
                                            onChange={(e) => {
                                                setEmail_f(e.target.value);
                                                setCheckMessage(""); // 清空檢查訊息
                                                if (emailFError) validateEmailPrefix(e.target.value);
                                            }}
                                            onBlur={(e) => {
                                                validateEmailPrefix(e.target.value);
                                                if (email_b) checkAc(e); // 如果已填寫網域,自動檢查
                                            }}
                                            placeholder="使用者名稱"
                                            disabled={isLoading}
                                        />
                                        <span className="email-separator">@</span>
                                        <input
                                            type="text"
                                            className="email-input-right"
                                            value={email_b}
                                            onChange={(e) => {
                                                setEmail_b(e.target.value);
                                                setCheckMessage(""); // 清空檢查訊息
                                                if (emailBError) validateEmailDomain(e.target.value);
                                            }}
                                            onBlur={(e) => {
                                                validateEmailDomain(e.target.value);
                                                if (email_f) checkAc(e); // 如果已填寫前綴,自動檢查
                                            }}
                                            placeholder="信箱網域"
                                            disabled={isLoading}
                                        />
                                    </div>
                                    {emailFError && <div className="check-message error">{emailFError}</div>}
                                    {emailBError && <div className="check-message error">{emailBError}</div>}
                                    {checkMessage && !emailFError && !emailBError && (
                                        <div className={`check-message ${checkMessage.includes('✅') ? 'success' : 'error'}`}>
                                            {checkMessage}
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    className="btn-primary"
                                    onClick={sendVerificationCode}
                                    disabled={isLoading}
                                >
                                    {isLoading ? "發送中..." : "發送驗證碼"}
                                </button>
                            </div>
                        )}

                        {/* 步驟2: 輸入驗證碼 */}
                        {verificationStep === 2 && (
                            <div className="step-content">
                                <div className="verification-info">
                                    <span className="material-symbols-outlined">mail</span>
                                    <p>驗證碼已發送到</p>
                                    <strong>{email_f}@{email_b}</strong>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="code">驗證碼</label>
                                    <input
                                        type="text"
                                        id="code"
                                        className="verification-code-input"
                                        value={verificationCode}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                                            setVerificationCode(value);
                                        }}
                                        placeholder="請輸入6位數驗證碼"
                                        maxLength="6"
                                        disabled={isLoading || isLocked}
                                    />
                                    {isLocked ? (
                                        <div className="lock-warning" style={{
                                            color: '#dc3545',
                                            fontSize: '14px',
                                            marginTop: '8px',
                                            padding: '12px',
                                            backgroundColor: '#fff3cd',
                                            border: '1px solid #ffc107',
                                            borderRadius: '4px',
                                            textAlign: 'center'
                                        }}>
                                            🔒 驗證失敗次數過多<br/>
                                            請等待 <strong>{Math.floor(lockCountdown / 60)}:{String(lockCountdown % 60).padStart(2, '0')}</strong> 後再試
                                        </div>
                                    ) : remainingAttempts < 5 && (
                                        <div className="attempts-warning">
                                            ⚠️ 剩餘嘗試次數: {remainingAttempts} 次
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    className="btn-primary"
                                    onClick={verifyCode}
                                    disabled={isLoading || verificationCode.length !== 6 || isLocked}
                                >
                                    {isLoading ? "驗證中..." : isLocked ? "已鎖定" : "驗證"}
                                </button>

                                <div className="resend-section">
                                    {isLocked ? (
                                        <p className="countdown-text" style={{ color: '#dc3545' }}>
                                            鎖定中,無法重新發送
                                        </p>
                                    ) : countdown > 0 ? (
                                        <p className="countdown-text">
                                            {countdown} 秒後可重新發送
                                        </p>
                                    ) : (
                                        <button
                                            type="button"
                                            className="btn-link"
                                            onClick={() => {
                                                setVerificationStep(1);
                                                setVerificationCode("");
                                                setIsLocked(false);
                                                setLockCountdown(0);
                                            }}
                                        >
                                            重新發送驗證碼
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* 步驟3: 填寫其他資料 */}
                        {verificationStep === 3 && (
                            <form onSubmit={handleSubmit} className="step-content">
                                <div className="verified-email-display">
                                    <span className="material-symbols-outlined">check_circle</span>
                                    <span>{verifiedEmail}</span>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="password">密碼</label>
                                    <div className="password-input-wrapper">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            id="password"
                                            value={password}
                                            onChange={(e) => {
                                                setPassword(e.target.value);
                                                if (passwordError) validatePassword(e.target.value);
                                            }}
                                            onBlur={(e) => validatePassword(e.target.value)}
                                            placeholder="請輸入密碼（6-20位英數字）"
                                            disabled={isLoading}
                                        />
                                        <button
                                            type="button"
                                            className="toggle-password"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            <span className="material-symbols-outlined">
                                                {showPassword ? "visibility_off" : "visibility"}
                                            </span>
                                        </button>
                                    </div>
                                    {passwordError && <div className="check-message error">{passwordError}</div>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="name">姓名</label>
                                    <input
                                        type="text"
                                        id="name"
                                        value={cname}
                                        onChange={(e) => {
                                            setCname(e.target.value);
                                            if (nameError) validateName(e.target.value);
                                        }}
                                        onBlur={(e) => validateName(e.target.value)}
                                        placeholder="請輸入您的姓名"
                                        disabled={isLoading}
                                    />
                                    {nameError && <div className="check-message error">{nameError}</div>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="location">居住地</label>
                                    <select
                                        id="location"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        className="location-select"
                                        disabled={isLoading}
                                        required
                                    >
                                        <option value="">請選擇您的居住地</option>
                                        {cities.map((city) => (
                                            <option key={city} value={city}>{city}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="tel">電話</label>
                                    <input
                                        type="text"
                                        id="tel"
                                        value={tel}
                                        onChange={(e) => {
                                            setTel(e.target.value);
                                            if (telError) validateTel(e.target.value);
                                        }}
                                        onBlur={(e) => validateTel(e.target.value)}
                                        placeholder="請輸入您的電話"
                                        disabled={isLoading}
                                    />
                                    {telError && <div className="check-message error">{telError}</div>}
                                </div>

                                <button type="submit" className="btn-primary" disabled={isLoading}>
                                    {isLoading ? "註冊中..." : "完成註冊"}
                                </button>
                            </form>
                        )}

                        <p className="login-link">
                            已經有帳戶了？
                            <Link to="/login">登入</Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Register
