import MemberInfo from "./MemberInfo";
import MemberSidebar from "./MemberSidebar";
import RevisePage from "./RevisePage";
import { useTokenCheck } from "../hooks/useTokenCheck";
import { useDarkMode } from "../hooks/useDarkMode";
import "../Css/MemberPage.css";
import { Route, Routes, Navigate } from "react-router-dom";
import CollectPage from "./CollectPage";
import CheckoutOrder from "./CheckoutOrder";

function MemberPage() {
    // 每 5 分鐘檢查一次 token 是否過期
    useTokenCheck(5);

    // 深色模式
    const [isDark, toggleDarkMode] = useDarkMode();

    return (
        <div className="member-page-container">
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

            <div className="member-page-layout">
                <div className="member-page-content">
                    <div className="member-page-wrapper">
                        <>
                            <MemberSidebar />
                            <Routes>
                                <Route index element={<Navigate to="info" replace />} />
                                <Route path="info" element={<MemberInfo />} />
                                <Route path="revise/:field" element={<RevisePage />} />
                                <Route path="wishList" element={<CollectPage />} />
                                <Route path="checkoutOrders" element={<CheckoutOrder />} />
                            </Routes>
                        </>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MemberPage;