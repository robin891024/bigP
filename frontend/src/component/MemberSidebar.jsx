import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function MemberSidebar() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("info");
    const [account, setAccount] = useState("Loading...");
    const [name, setName] = useState("Loading...");

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
                setAccount(data.account),
                setName(data.name)
            })
            .catch(() => {
                setMessage('無法載入會員資料');
            });
    }, []);


    const handleLogout = async () => {
        try {
            const res = await fetch("http://localhost:8080/member/logout", {
                method: "POST",
                credentials: "include"
            });

            // 如果是 403 (token 過期)，直接跳轉到登入頁面並顯示過期訊息
            if (res.status === 403) {
                navigate("/login", { state: { expired: true } });
                return;
            }

            const success = await res.json();

            if (success) {
                navigate("/login");
            }
        } catch (error) {
            // 發生錯誤時也跳轉到登入頁面
            navigate("/login");
        }
    };

    return (
        <aside className="member-sidebar">
            <div className="sidebar-content">
                <div className="sidebar-header">
                    {/* 用戶頭像和資訊 */}
                    <div className="user-profile">
                        {/* <div 
                            className="user-avatar"
                            style={{
                                backgroundImage: `url("https://ui-avatars.com/api/?name=${encodeURIComponent(memberData?.name || 'User')}&background=197fe6&color=fff&size=128")`
                            }}
                        /> */}
                        <div className="user-info">
                            <h1 className="user-name">{name}</h1>
                            <p className="user-email">{account}</p>
                        </div>
                    </div>

                    {/* 導航選單 */}
                    <nav className="sidebar-nav">
                        <a
                            href="#"
                            className={`nav-item ${activeTab === "info" ? "active" : ""}`}
                            onClick={(e) => {
                                e.preventDefault();
                                setActiveTab("info");
                            }}
                        >
                            <span className="material-symbols-outlined">person</span>
                            <p>會員資訊</p>
                        </a>
                        <a
                            href="#"
                            className={`nav-item ${activeTab === "favorites" ? "active" : ""}`}
                            onClick={(e) => {
                                e.preventDefault();
                                setActiveTab("favorites");
                            }}
                        >
                            <span className="material-symbols-outlined unfilled">favorite</span>
                            <p>收藏</p>
                        </a>
                        <a
                            href="#"
                            className={`nav-item ${activeTab === "history" ? "active" : ""}`}
                            onClick={(e) => {
                                e.preventDefault();
                                setActiveTab("history");
                            }}
                        >
                            <span className="material-symbols-outlined unfilled">receipt_long</span>
                            <p>購買紀錄</p>
                        </a>
                    </nav>
                </div>

                {/* 登出按鈕 */}
                <div className="sidebar-footer">
                    <a
                        href="#"
                        className="nav-item logout"
                        onClick={(e) => {
                            e.preventDefault();
                            handleLogout();
                        }}
                    >
                        <span className="material-symbols-outlined">logout</span>
                        <p>登出</p>
                    </a>
                </div>
            </div>
        </aside>
    );
}

export default MemberSidebar;