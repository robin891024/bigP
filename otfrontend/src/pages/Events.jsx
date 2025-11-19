// src/pages/Events.jsx

import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const events = [
    {
        id: 1,
        image: "https://static.tixcraft.com/images/activity/26_billyrrom_b81ed522a9af6ae5799e0133213bdcb0.jpg",
        date: "2026/04/18 (六)",
        title: "Billyrrom Asia Tour 2026 “Jupiter=” in Taipei",
    },
    {
        id: 2,
        image: "https://static.tixcraft.com/images/activity/26_treasure_c_7f0cb49c30996800155dd7b759072472.jpg",
        date: "2026/03/28 (六)",
        title: "【Mastercard專區】2025-26 TREASURE TOUR [PULSE ON] IN TAIPEI",
    },
    {
        id: 3,
        image: "https://static.tixcraft.com/images/activity/26_treasure_8e5cabef2a455b291a9e6646f800eb63.jpg",
        date: "2026/03/28 (六)",
        title: "2025-26 TREASURE TOUR [PULSE ON] IN TAIPEI",
    },
    {
        id: 4,
        image: "https://static.tixcraft.com/images/activity/26_1rtp_9db4827c1d7503fb1952d400e0dfb5e9.jpg",
        date: "2026/03/04 (三)",
        title: "ONEREPUBLIC “From Asia， With Love” 2026 in Taipei",
    },
    {
        id: 5,
        image: "https://static.tixcraft.com/images/activity/26_1rtp_c_9b46bdb86275153f55ae1c6c875a1ff4.jpg",
        date: "2026/03/04 (三)",
        title: "【Mastercard專區】ONEREPUBLIC “From Asia， With Love” 2026 in Taipei",
    },
    {
        id: 6,
        image: "https://static.tixcraft.com/images/activity/26_1rtp_v_3bbc7e0b0ca2abf607c30e7b32136228.jpg",
        date: "2026/03/04 (三)",
        title: "ONEREPUBLIC “From Asia， With Love” 2026 in Taipei (VIP)",
    },
    {
        id: 7,
        image: "https://static.tixcraft.com/images/activity/26_mj116_a702095644966b2d152d4425a237c66d.png",
        date: "2026/01/31 (六) ~ 2026/02/01 (日)",
        title: "【非實名制區】頑童MJ116 OGS 台中洲際演唱會",
    },
    {
        id: 8,
        image: "https://static.tixcraft.com/images/activity/26_mj116_r_d4488bb56d87705bd8309d2e33b59e15.png",
        date: "2026/01/31 (六) ~ 2026/02/01 (日)",
        title: "【實名制區】頑童MJ116 OGS 台中洲際演唱會",
    },
    {
        id: 9,
        image: "https://static.tixcraft.com/images/activity/26_txt_5b6d3cd38800e24cb444113293a89d26.jpg",
        date: "2026/01/31 (六) ~ 2026/02/01 (日)",
        title: "TOMORROW X TOGETHER WORLD TOUR ＜ACT：TOMORROW＞ IN TAIPEI",
    },
    {
        id: 10,
        image: "https://static.tixcraft.com/images/activity/26_annbai_7023773ee544349b1ec8068e4487b6ae.jpg",
        date: "2026/01/25 (日) ~ 2026/03/07 (六)",
        title: "白安 ANN《路邊野餐 Summer Tryst》2026 New Album Live Tour",
    },
    {
        id: 11,
        image: "https://static.tixcraft.com/images/activity/26_sjkh_4d21e34d543b1879ea10feb8227d4d1b.jpg",
        date: "2026/01/24 (六) ~ 2026/01/25 (日)",
        title: "SUPER JUNIOR 20th Anniversary TOUR ＜SUPER SHOW 10＞ in KAOHSIUNG",
    },
    {
        id: 12,
        image: "https://static.tixcraft.com/images/activity/26_energy_6b7c339709b8938fbf01086933d97d9c.jpg",
        date: "2026/01/10 (六) ~ 2026/01/11 (日)",
        title: "Energy《ALL IN 全面進擊》台北小巨蛋演唱會",
    },
    {
        id: 13,
        image: "https://static.tixcraft.com/images/activity/25_whyte_d67c74c08e8e92e0f245168565be751d.jpg",
        date: "2025/12/28 (日)",
        title: "Whyte 2025 Live Concert Boundary",
    },
    {
        id: 14,
        image: "https://static.tixcraft.com/images/activity/25_mdbustc_f228736fc0ca611808755956f7c47ec5.png",
        date: "2025/12/27 (六) ~ 2026/01/04 (日)",
        title: "【歌迷返鄉專車】x 五月天 [ 回到那一天 ] 25 週年巡迴演唱會台中站",
    },
    {
        id: 15,
        image: "https://static.tixcraft.com/images/activity/25_mayday_p_e0f055de9f69c60585006943ecbcc319.jpg",
        date: "2025/12/27 (六) ~ 2026/01/04 (日)",
        title: "MAYDAY #5525 LIVE TOUR 五月天 [回到那一天] 25 週年巡迴演唱會 台中站．新年快樂版 親子套票專區",
    },
    {
        id: 16,
        image: "https://static.tixcraft.com/images/activity/25_mayday_c_add0dcf4f2887e5f40b6a3e8c34baa58.jpg",
        date: "2025/12/27 (六) ~ 2026/01/04 (日)",
        title: "MAYDAY #5525 LIVE TOUR 五月天 [回到那一天] 25 週年巡迴演唱會 台中站•新年快樂版 玉山卡友專區",
    },
    {
        id: 17,
        image: "https://static.tixcraft.com/images/activity/25_mayday_6d736a75b5affd6c3be6ba517493bea8.jpg",
        date: "2025/12/27 (六) ~ 2026/01/04 (日)",
        title: "MAYDAY #5525 LIVE TOUR 五月天 [回到那一天] 25 週年巡迴演唱會 台中站•新年快樂版",
    },
    {
        id: 18,
        image: "https://static.tixcraft.com/images/activity/25_dojacat_d1e54e162393bf7f54120a4cd937dee7.jpg",
        date: "2025/12/21 (日)",
        title: "Doja Cat – Ma Vie World Tour",
    },
    {
        id: 19,
        image: "https://static.tixcraft.com/images/activity/25_dojacat_c_934e94a84d0b905e58b6cb371c5304c6.jpg",
        date: "2025/12/21 (日)",
        title: "【Mastercard專區】Doja Cat – Ma Vie World Tour",
    },
    {
        id: 20,
        image: "https://static.tixcraft.com/images/activity/25_dojacat_v_b0fe66f659b800d4a9b1576ec96ef3f1.jpg",
        date: "2025/12/21 (日)",
        title: "【VIP Upgrade/升級VIP】Doja Cat – Ma Vie World Tour",
    },
    {
        id: 21,
        image: "https://static.tixcraft.com/images/activity/25_cosmos_bb2f924cedec2bb9322c370caadefd21.jpg",
        date: "2025/12/20 (六)",
        title: "vivo x 宇宙人 [ α：回到未來1986 ] 台北小巨蛋演唱會",
    },
    {
        id: 22,
        image: "https://static.tixcraft.com/images/activity/25_wakinkh_bfea1acf6db0976768a9a83dba487ee6.jpg",
        date: "2025/11/29 (六)",
        title: "周華健 少年的奇幻之旅3.0巡迴演唱會【高雄站】",
    },
    {
        id: 23,
        image: "https://static.tixcraft.com/images/activity/25_bbnomoney_80e9d98a081053cb8c45b521a62455bf.jpg",
        date: "2025/11/14 (五)",
        title: "bbno$：it’s pronounced baby no money",
    },
    {
        id: 24,
        image: "https://static.tixcraft.com/images/activity/25_bbnomoney_v_ac052ebba0e99ff24911a4d9582e238d.jpg",
        date: "2025/11/14 (五)",
        title: "【VIP Upgrade/升級VIP】bbno$：it’s pronounced baby no money",
    },
    {
        id: 25,
        image: "https://static.tixcraft.com/images/activity/25_jannabi_cb7ac723c43c94b6ee3f918252733680.jpg",
        date: "2025/11/09 (日)",
        title: "JANNABI LIVE：TAIPEI Ⅰ",
    },
];

export default function Events() {
    const [tab, setTab] = useState("all"); // "all" | "upcoming"
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
            <Header showSearchBar={true}/>
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
                <div className="w-full md:w-1/3 flex mb-8 bg-white rounded-lg shadow-sm border overflow-hidden">
                    <Button
                        className={`flex-1 rounded-none py-3 text-base font-medium transition-colors duration-150 ${tab === "all" ? "bg-primary text-white" : "bg-white text-gray-700 hover:bg-gray-100"}`}
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
                                    <div className="date text-gray-500 text-sm mb-1">{event.date}</div>
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
