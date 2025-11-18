// src/pages/Events.jsx

import { useState } from "react";
import Header from "../component/Header";
import Footer from "../component/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const events = [
    // ...existing code...
];

export default function Events() {
    const [selected, setSelected] = useState(null);
    const [tab, setTab] = useState("all"); // "all" | "upcoming" | "new"
    const navigate = useNavigate();

    // 依 tab 狀態決定顯示的活動
    let displayEvents = events;
    if (tab === "upcoming") {
        displayEvents = [...events].sort((a, b) => {
            // 解析日期字串為 Date 物件
            const parseDate = (str) => {
                // 2026/03/04 (三)
                const [date] = str.split(" ");
                return new Date(date.replace(/\//g, "-"));
            };
            return parseDate(a.date) - parseDate(b.date);
        });
    }

    return (
        <div className="font-sans min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 bg-bg px-6 py-8 max-w-7xl mx-auto w-full">
                {/* 麵包屑 */}
                <nav className="text-sm text-gray-500 mb-6">
                    <span
                        className="hover:underline cursor-pointer"
                        onClick={() => navigate("/")}
                    >
                        首頁
                    </span>
                    <span className="mx-2">/</span>
                    <span className="text-text">節目資訊</span>
                </nav>

                {/* 分頁按鈕 */}
                <div className="w-1/3 flex mb-8 bg-white rounded-lg shadow-sm border overflow-hidden">
                    <Button
                        className={`flex-1 rounded-none py-3 text-base font-medium transition-colors duration-150 ${tab === "all" ? "bg-primary text-white" : "bg-white text-gray-700 hover:bg-gray-100"}`}
                        style={{ boxShadow: "none", border: "none" }}
                        onClick={() => setTab("all")}
                        tabIndex={0}
                        aria-selected={tab === "all"}
                    >全部節目</Button>
                    <Button
                        className={`flex-1 rounded-none py-3 text-base font-medium transition-colors duration-150 border-l ${tab === "upcoming" ? "bg-primary text-white" : "bg-white text-gray-700 hover:bg-gray-100"}`}
                        style={{ boxShadow: "none", border: "none" }}
                        onClick={() => setTab("upcoming")}
                        tabIndex={0}
                        aria-selected={tab === "upcoming"}
                    >近期演出</Button>
                    <Button
                        className={`flex-1 rounded-none py-3 text-base font-medium transition-colors duration-150 border-l ${tab === "new" ? "bg-primary text-white" : "bg-white text-gray-700 hover:bg-gray-100"}`}
                        style={{ boxShadow: "none", border: "none" }}
                        onClick={() => setTab("new")}
                        tabIndex={0}
                        aria-selected={tab === "new"}
                    >最新開賣</Button>
                </div>

                {/* 卡片區塊 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                    {displayEvents.map((event, idx) => (
                        <Card
                            key={idx}
                            className="bg-white shadow-md cursor-pointer hover:shadow-2xl hover:scale-105 transition p-0"
                            onClick={() => setSelected(event)}
                        >
                            <div className="thumbnails">
                                <div className="thumb-shadow relative">
                                    <img
                                        src={event.image}
                                        alt={event.title}
                                        className="w-full h-48 object-cover"
                                        onError={e => (e.target.src = "/images/no-image1.png")}
                                    />
                                    {/* 下箭頭SVG */}
                                    <svg className="absolute bottom-2 right-2 text-gray-400" viewBox="0 0 24 24" width="1.5em" height="1.5em" aria-hidden="true" focusable="false">
                                        <path d="M6.99 9.16a.6.6 0 00-.4-.16.6.6 0 00-.42.16.5.5 0 00-.17.37c0 .14.07.28.17.37l5.45 4.92c.04.06.09.1.15.15.14.05.3.05.44 0a.6.6 0 00.18-.11l5.45-4.92a.5.5 0 00.16-.37.5.5 0 00-.16-.37.6.6 0 00-.41-.16.6.6 0 00-.41.16l-5.03 4.46-5-4.5z"></path>
                                    </svg>
                                </div>
                                <div className="data p-4">
                                    <div className="date text-gray-500 text-sm mb-1">{event.date}</div>
                                    <div className="multi_ellipsis font-semibold text-lg text-text leading-snug">{event.title}</div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* 活動詳情彈窗 */}
                {selected && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative animate-fade-in">
                            <button
                                className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
                                onClick={() => setSelected(null)}
                                aria-label="關閉"
                            >
                                ×
                            </button>
                            <img src={selected.image} alt={selected.title} className="w-full h-48 object-cover rounded mb-4" />
                            <div className="text-gray-500 text-sm mb-2">{selected.date}</div>
                            <div className="font-semibold text-xl text-text mb-2">{selected.title}</div>
                            <div className="text-gray-600">（此處可放更多活動資訊或連結）</div>
                        </div>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
