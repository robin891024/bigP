import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Calendar from "./Calendar";

function MemberInfo() {
    const navigate = useNavigate();
    const [message, setMessage] = useState("");
    const [account, setAccount] = useState("Loading...");
    const [city, setCity] = useState("Loading...");
    const [name, setName] = useState("Loading...");
    const [tel, setTel] = useState("Loading...");
    const [id, setId] = useState("Loading...");

    useEffect(() => {
        fetch("http://localhost:8080/member/profile", {
            credentials: 'include'
        })
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                console.log(data);
                setId(data.id);
                setAccount(data.account);
                setName(data.name);
                setCity(data.city);
                setTel(data.tel);
            })
            .catch(() => {
                setMessage('無法載入會員資料');
            });
    }, []);

    return (
        <main className="member-content">
            {message}
            <div className="content-wrapper">
                {/* 會員資訊卡片 */}
                <div className="info-card">
                    <div className="card-header">
                        <h2 className="card-title">會員資訊</h2>
                    </div>

                    <div className="info-list">
                        {/* 帳號 */}
                        <div className="info-item">
                            <div className="info-item-content">
                                <div className="info-icon">
                                    <span className="material-symbols-outlined">account_circle</span>
                                </div>
                                <div className="info-details">
                                    <p className="info-label">帳號</p>
                                    <p className="info-value">{account}</p>
                                </div>
                            </div>
                        </div>

                        {/* 密碼 */}
                        <div className="info-item">
                            <div className="info-item-content">
                                <div className="info-icon">
                                    <span className="material-symbols-outlined">lock</span>
                                </div>
                                <div className="info-details">
                                    <p className="info-label">密碼</p>
                                    <p className="info-value">••••••••</p>
                                </div>
                            </div>
                            <button className="edit-button" onClick={() => navigate('/member/revise/password')}>
                                <span>修改</span>
                            </button>
                        </div>

                        {/* 姓名 */}
                        <div className="info-item">
                            <div className="info-item-content">
                                <div className="info-icon">
                                    <span className="material-symbols-outlined">badge</span>
                                </div>
                                <div className="info-details">
                                    <p className="info-label">姓名</p>
                                    <p className="info-value">{name}</p>
                                </div>
                            </div>
                            <button className="edit-button" onClick={() => navigate('/member/revise/name')}>
                                <span>修改</span>
                            </button>
                        </div>

                        {/* 居住地 */}
                        <div className="info-item">
                            <div className="info-item-content">
                                <div className="info-icon">
                                    <span className="material-symbols-outlined">home</span>
                                </div>
                                <div className="info-details">
                                    <p className="info-label">居住地</p>
                                    <p className="info-value">{city}</p>
                                </div>
                            </div>
                            <button className="edit-button" onClick={() => navigate('/member/revise/city')}>
                                <span>修改</span>
                            </button>
                        </div>

                        {/* 電話 */}
                        <div className="info-item">
                            <div className="info-item-content">
                                <div className="info-icon">
                                    <span className="material-symbols-outlined">call</span>
                                </div>
                                <div className="info-details">
                                    <p className="info-label">電話</p>
                                    <p className="info-value">{tel}</p>
                                </div>
                            </div>
                            <button className="edit-button" onClick={() => navigate('/member/revise/tel')}>
                                <span>修改</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* 行事曆卡片 */}
                <div className="calendar-card">
                    {typeof id === 'number' ? (
                        <Calendar userId={id} />
                    ) : (
                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                            載入中...
                        </div>
                    )}
                </div>

            </div>
        </main>
    );
}

export default MemberInfo;