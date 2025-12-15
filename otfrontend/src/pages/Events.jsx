// src/pages/Events.jsx

import { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import EventTabs from "../components/EventTabs";
import EventGrid from "../components/EventGrid";
import { useNavigate, useLocation } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb";

export default function Events() {
    // 分頁狀態與活動資料
    const [tab, setTab] = useState("all");
    const [events, setEvents] = useState([]);
    const [error, setError] = useState(null); // 新增錯誤狀態
    const [loading, setLoading] = useState(true); // 新增載入狀態
    const navigate = useNavigate();
    const location = useLocation();

    // 取得 URL 上的 keyword 參數
    const searchParams = new URLSearchParams(location.search);
    const keyword = searchParams.get("keyword")?.trim() || "";

    // 取得活動資料並格式化日期
    useEffect(() => {
        setLoading(true);
        setError(null);
        fetch("/api/events")
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                const fixed = Array.isArray(data)
                    ? data.map(event => ({
                        ...event,
                        eventStart: formatDate(event.eventStart)
                    }))
                    : [];
                setEvents(fixed);
            })
            .catch((error) => {
                console.error("取得活動資料失敗", error);
                setError("無法載入活動資料，請稍後再試。");
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    // 依分頁與關鍵字過濾活動
    let filteredEvents = Array.isArray(events) ? events : [];
    if (tab === "upcoming") {
        filteredEvents = [...filteredEvents].sort((a, b) => {
            const parseDate = (str) => new Date(str);
            return parseDate(a.eventStart) - parseDate(b.eventStart);
        });
    }
    if (keyword) {
        const lower = keyword.toLowerCase();
        filteredEvents = filteredEvents.filter(
            (event) =>
                event.title?.toLowerCase().includes(lower) ||
                event.address?.toLowerCase().includes(lower)
        );
    }

    return (
        <div className="font-sans min-h-screen flex flex-col">
            <Header showSearchBar={true} />
            <main className="flex-1 bg-bg px-6 py-8 max-w-7xl mx-auto w-full">
                {/* 麵包屑 */}
                <Breadcrumb
                    items={[
                        { label: "首頁", to: "/" },
                        { label: "活動資訊" }
                    ]}
                    className="mb-6 text-gray-500"
                />

                {/* 分頁按鈕 */}
                <EventTabs tab={tab} onTabChange={setTab} />

                {/* 錯誤提示與載入狀態 */}
                {loading && (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-6 text-center" role="alert">
                        <strong className="font-bold">錯誤！</strong>
                        <span className="block sm:inline"> {error}</span>
                    </div>
                )}

                {/* 活動卡片區塊 */}
                {!loading && !error && (
                    <EventGrid
                        events={filteredEvents}
                        onEventClick={event => navigate(`/events/detail/${event.id}`)}
                    />
                )}
            </main>
            <Footer />
        </div>
    );
}

// 日期格式化工具
function formatDate(dateStr) {
    if (!dateStr) return "未定";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "未定";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}/${m}/${day}`;
}
