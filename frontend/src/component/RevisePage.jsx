import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../Css/Register.css";

function RevisePage() {
    const { field } = useParams();
    const navigate = useNavigate();

    const [currentValue, setCurrentValue] = useState("");
    const [newValue, setNewValue] = useState("");
    const [confirmValue, setConfirmValue] = useState("");
    const [currentPassword, setCurrentPassword] = useState(""); // 用於身份驗證
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [alertMsg, setAlertMsg] = useState("");
    const [alertType, setAlertType] = useState("");
    const [location, setLocation] = useState("");

    // 根據欄位類型設定標題和標籤
    const fieldConfig = {
        password: {
            title: "修改密碼",
            currentLabel: "目前密碼",
            newLabel: "新密碼",
            confirmLabel: "確認新密碼",
            type: "password"
        },
        name: {
            title: "修改姓名",
            currentLabel: "目前姓名",
            newLabel: "新姓名",
            type: "text"
        },
        city: {
            title: "修改居住地",
            currentLabel: "目前居住地",
            newLabel: "新居住地",
            type: "select"
        },
        tel: {
            title: "修改電話",
            currentLabel: "目前電話",
            newLabel: "新電話",
            type: "tel"
        }
    };

    const config = fieldConfig[field] || fieldConfig.name;

    const cities = [
        "台北市", "新北市", "桃園市", "台中市", "台南市", "高雄市",
        "基隆市", "新竹市", "新竹縣", "苗栗縣", "彰化縣", "南投縣",
        "雲林縣", "嘉義市", "嘉義縣", "屏東縣", "宜蘭縣", "花蓮縣",
        "台東縣", "澎湖縣", "金門縣", "連江縣"
    ];

    useEffect(() => {
        // 載入目前的會員資料
        fetch("http://localhost:8080/member/profile", {
            credentials: 'include'
        })
            .then(res => res.json())
            .then(data => {
                if (field === 'name') {
                    setCurrentValue(data.name);
                } else if (field === 'city') {
                    setCurrentValue(data.city);
                    setLocation(data.city);
                } else if (field === 'tel') {
                    setCurrentValue(data.tel);
                }
            })
            .catch(() => {
                showAlert("無法載入會員資料", "error");
            });
    }, [field]);

    const showAlert = (message, type) => {
        setAlertMsg(message);
        setAlertType(type);
        setTimeout(() => {
            setAlertMsg("");
        }, 3000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 驗證
        if (field === 'password') {
            if (!currentPassword) {
                showAlert("⚠️ 請輸入當前密碼以確認身份", "error");
                return;
            }
            if (!newValue || !confirmValue) {
                showAlert("⚠️ 請完整填寫所有欄位", "error");
                return;
            }
            if (newValue == currentPassword) {
                showAlert("⚠️ 新密碼與舊密碼相同", "error");
                return;
            }
            if (newValue !== confirmValue) {
                showAlert("⚠️ 新密碼與確認密碼不符", "error");
                return;
            }
            if (newValue.length < 6) {
                showAlert("⚠️ 密碼長度至少需要 6 個字元", "error");
                return;
            }
        } else if (field === 'name') {
            if (!currentPassword) {
                showAlert("⚠️ 請輸入當前密碼以確認身份", "error");
                return;
            }
            if (!newValue.trim()) {
                showAlert("⚠️ 請輸入新姓名", "error");
                return;
            }
        } else if (field === 'city') {
            if (!currentPassword) {
                showAlert("⚠️ 請輸入當前密碼以確認身份", "error");
                return;
            }
            if (!location) {
                showAlert("⚠️ 請選擇居住地", "error");
                return;
            }
        } else if (field === 'tel') {
            if (!currentPassword) {
                showAlert("⚠️ 請輸入當前密碼以確認身份", "error");
                return;
            }
            if (!newValue.trim()) {
                showAlert("⚠️ 請輸入新電話", "error");
                return;
            }
            // 驗證電話格式 (台灣手機號碼格式)
            const telPattern = /^09\d{8}$/;
            if (!telPattern.test(newValue.trim())) {
                showAlert("⚠️ 請輸入有效的手機號碼格式 (09xxxxxxxx)", "error");
                return;
            }
        }

        try {
            const res = await fetch("http://localhost:8080/member/passwordVerify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    password: currentPassword
                }),
            })

            const data = await res.json();
            if (data.success) {

                const request = await fetch("http://localhost:8080/member/revise", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({
                        password: field === 'password' ? newValue : null,
                        name: field === 'name' ? newValue : null,
                        city: field === 'city' ? location : null,
                        tel: field === 'tel' ? newValue : null
                    }),
                })

                const reviseData = await request.json();

                if (reviseData.success) {
                    showAlert("🎉 修改成功！", "success");

                    setTimeout(() => {
                        navigate('/member/info');
                    }, 1500);
                }else {
                    showAlert("❌ 修改失敗，請稍後再試", "error");
                }

            } else {
                showAlert("❌ 密碼錯誤", "error");
            }
        } catch (err) {
            showAlert("❌ 修改失敗，請稍後再試", "error");
        }
    };

    return (
        <>
            {alertMsg && (
                <div className={`alert-bar ${alertType}`}>
                    {alertMsg}
                </div>
            )}

            <main className="member-content">
                <div className="content-wrapper">
                    <div className="register-container" style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <div className="register-card">
                            <div className="register-header">
                                <h1>{config.title}</h1>
                                <p className="subtitle">請輸入新的資料</p>
                            </div>

                            <form onSubmit={handleSubmit}>
                                {/* 身份驗證 - 所有修改都需要輸入當前密碼 */}
                                <div className="form-group">
                                    <label htmlFor="currentPassword">
                                        當前密碼 <span style={{ color: '#dc3545' }}>*</span>
                                    </label>
                                    <div className="password-input-wrapper">
                                        <input
                                            type={showCurrentPassword ? "text" : "password"}
                                            id="currentPassword"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            placeholder="請輸入當前密碼以確認身份"
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="toggle-password"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        >
                                            <span className="material-symbols-outlined">
                                                {showCurrentPassword ? "visibility_off" : "visibility"}
                                            </span>
                                        </button>
                                    </div>
                                    <small style={{ color: '#6c757d', fontSize: '0.875rem' }}>
                                        為了您的帳戶安全,修改資料前需要驗證身份
                                    </small>
                                </div>

                                {/* 目前的值 (密碼除外) */}
                                {field !== 'password' && (
                                    <div className="form-group">
                                        <label>{config.currentLabel}</label>
                                        <input
                                            type="text"
                                            value={currentValue}
                                            disabled
                                            style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                                        />
                                    </div>
                                )}

                                {/* 密碼欄位 */}
                                {field === 'password' && (
                                    <>
                                        <div className="form-group">
                                            <label htmlFor="new">{config.newLabel}</label>
                                            <div className="password-input-wrapper">
                                                <input
                                                    type={showNewPassword ? "text" : "password"}
                                                    id="new"
                                                    value={newValue}
                                                    onChange={(e) => setNewValue(e.target.value)}
                                                    placeholder="請輸入新密碼"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    className="toggle-password"
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                >
                                                    <span className="material-symbols-outlined">
                                                        {showNewPassword ? "visibility_off" : "visibility"}
                                                    </span>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="confirm">{config.confirmLabel}</label>
                                            <div className="password-input-wrapper">
                                                <input
                                                    type={showNewPassword ? "text" : "password"}
                                                    id="confirm"
                                                    value={confirmValue}
                                                    onChange={(e) => setConfirmValue(e.target.value)}
                                                    placeholder="請再次輸入新密碼"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* 姓名欄位 */}
                                {field === 'name' && (
                                    <div className="form-group">
                                        <label htmlFor="new">{config.newLabel}</label>
                                        <input
                                            type="text"
                                            id="new"
                                            value={newValue}
                                            onChange={(e) => setNewValue(e.target.value)}
                                            placeholder="請輸入新姓名"
                                            required
                                        />
                                    </div>
                                )}

                                {/* 居住地欄位 */}
                                {field === 'city' && (
                                    <div className="form-group">
                                        <label htmlFor="location">{config.newLabel}</label>
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
                                )}

                                {/* 電話欄位 */}
                                {field === 'tel' && (
                                    <div className="form-group">
                                        <label htmlFor="new">{config.newLabel}</label>
                                        <input
                                            type="tel"
                                            id="new"
                                            value={newValue}
                                            onChange={(e) => setNewValue(e.target.value)}
                                            placeholder="請輸入新電話 (09xxxxxxxx)"
                                            pattern="09\d{8}"
                                            required
                                        />
                                        <small style={{ color: '#6c757d', fontSize: '0.875rem' }}>
                                            請輸入台灣手機號碼格式，例如：0912345678
                                        </small>
                                    </div>
                                )}

                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button
                                        type="button"
                                        className="btn-primary"
                                        onClick={() => navigate('/member/info')}
                                        style={{ backgroundColor: '#6c757d' }}
                                    >
                                        取消
                                    </button>
                                    <button type="submit" className="btn-primary">
                                        確認修改
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}

export default RevisePage;