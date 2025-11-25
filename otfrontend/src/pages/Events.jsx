// src/pages/Events.jsx

import { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb";

export default function Events() {
    const [tab, setTab] = useState("all");
    const [events, setEvents] = useState([]); // 假設活動資料會從 API 獲取並存入此狀態
    const navigate = useNavigate();

    // 模擬從 API 獲取活動資料
    useEffect(() => {
        fetch("/api/events")
            .then(res => res.json())
            .then(data => {
                const fixed = Array.isArray(data)
                    ? data.map(event => ({
                        ...event,
                        eventStart: formatDate(event.eventStart)
                    }))
                    : [];
                setEvents(fixed);
            })
            .catch((error) => console.error("取得活動資料失敗", error));
    }, []);
  
  // 日期格式化函式
  function formatDate(dateStr) {
      if (!dateStr) return "未定";
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "未定";
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}/${m}/${day}`;
  }

    // 根據選擇的分頁篩選活動
    let displayEvents = Array.isArray(events) ? events : [];
    if (tab === "upcoming"){
        displayEvents = [...displayEvents].sort((a, b) => {
            const parseDate = (str) => new Date(str);
            return parseDate(a.eventStart) - parseDate(b.eventStart);
        });
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
                <div className="w-full md:w-1/3 flex mb-8 bg-white rounded-lg shadow-sm border overflow-hidden">
                    <Button
                        className={`flex-1 rounded-none py-3 text-base font-medium transition-colors duration-150 ${tab === "all" ? "bg-primary text-white" : "bg-white text-gray-700 hover:bg-gray-100"}`}
                        onClick={() => setTab("all")}
                        tabIndex={0}
                        aria-selected={tab === "all"}
                    >全部活動</Button>
                    <Button
                        className={`flex-1 rounded-none py-3 text-base font-medium transition-colors duration-150 border-l ${tab === "upcoming" ? "bg-primary text-white" : "bg-white text-gray-700 hover:bg-gray-100"}`}
                        style={{ boxShadow: "none", border: "none" }}
                        onClick={() => setTab("upcoming")}
                        tabIndex={0}
                        aria-selected={tab === "upcoming"}
                    >近期活動</Button>
                </div>

                {/* 卡片區塊 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                    {displayEvents.map((event) => (
                        <Card
                            key={event.id}
                            className="bg-white shadow-md cursor-pointer hover:shadow-2xl hover:scale-105 transition p-0"
                            onClick={() => {
                                navigate(`/events/detail/${event.id}`);
                            }}
                        >
                            <div className="thumbnails">
                                <div className="thumb-shadow relative">
                                    <img
                                        src={event.image}
                                        alt={event.title}
                                        className="w-full h-auto object-cover"
                                        onError={e => (e.target.src = "/images/no-image1.png")}
                                    />
                                    {/* 下箭頭SVG */}
                                    <svg className="absolute bottom-2 right-2 text-gray-400" viewBox="0 0 24 24" width="1.5em" height="1.5em" aria-hidden="true" focusable="false">
                                        <path d="M6.99 9.16a.6.6 0 00-.4-.16.6.6 0 00-.42.16.5.5 0 00-.17.37c0 .14.07.28.17.37l5.45 4.92c.04.06.09.1.15.15.14.05.3.05.44 0a.6.6 0 00.18-.11l5.45-4.92a.5.5 0 00.16-.37.5.5 0 00-.16-.37.6.6 0 00-.41-.16.6.6 0 00-.41.16l-5.03 4.46-5-4.5z"></path>
                                    </svg>
                                </div>
                                <div className="data p-4">
                                    <div className="date text-gray-500 text-sm mb-1">{event.eventStart}</div>
                                    <div className="multi_ellipsis font-semibold text-lg text-text leading-snug">{event.title}</div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </main>
            <Footer />
        </div>
    );
}
