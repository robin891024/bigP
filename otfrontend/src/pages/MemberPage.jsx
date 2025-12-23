import MemberInfo from "../components/MemberInfo";
import MemberSidebar from "../components/MemberSidebar";
import RevisePage from "../components/RevisePage";
import { useTokenCheck } from "../hooks/useTokenCheck";
import { useDarkMode } from "../hooks/useDarkMode";
import "../Css/MemberPage.css";
import { Route, Routes, Navigate } from "react-router-dom";
import Header from '../components/Header'; 
import Footer from '../components/Footer'; 
import Top from '../components/ui/Top';
import CollectPage from '../components/CollectPage';
import CheckoutOrder from "../components/CheckoutOrder";
import Qrcode from "../components/Qrcode";

function MemberPage() {
    // 每 5 分鐘檢查一次 token 是否過期
    useTokenCheck(5);

    // 深色模式
    const [isDark, toggleDarkMode] = useDarkMode();

    return (
        <>
        <Header showSearchBar={true} /> 
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
                                <Route path="wishList" element={<CollectPage />}/>
                                <Route path="history" element={<CheckoutOrder />} />
                                <Route path="qrcode" element={<Qrcode />} />
                            </Routes>
                        </>
                    </div>
                </div>
            </div>
        </div>
        <Top />
        <Footer />
    </>
    );
}

export default MemberPage;