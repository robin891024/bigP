// src/components/AnnouncementList.jsx
import React, { useState, useEffect } from 'react';

/**
 * 公告列表元件
 * @param {number | null} limit - 限制顯示的公告數量。null 表示顯示全部。
 * @param {boolean} isFullPage - 是否為完整公告頁面。影響「查看更多」按鈕的顯示。
 * @param {function} onSelectAnnouncement - 點擊公告項目時執行的回呼函式。
 */
function AnnouncementList({ limit = null, isFullPage = false, onSelectAnnouncement }) {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                setLoading(true);
                setError(null);

                let url = 'http://localhost:8080/api/announcements';
                
                // 1. 處理 limit 參數：如果 limit 存在，則將其作為查詢參數加入 URL
                if (limit) {
                    url += `?limit=${limit}`; 
                }
                // console.log("Fetching announcements from URL:", url);
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP 錯誤! 狀態碼: ${response.status}`);
                }
                
                const data = await response.json();
                
                const formattedData = data.map(ann => ({
                    ...ann,
                    // 格式化日期
                    dateOnly: new Date(ann.created_at || ann.date).toLocaleDateString('zh-TW', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                    }).replace(/\//g, '/'), 
                    
                    // ***** 核心修改：根據 role 判斷標籤 *****
                    // 假設後端返回的公告物件中包含 ann.publisher_role 欄位
                    tag: (ann.role === 0) 
                        ? '系統公告' // 角色 0 為系統/開發者 (根據 user 表格 role 欄位)
                        : (ann.role === 1) 
                            ? '活動公告' // 角色 1 為主辦方
                            : '一般公告', // 其他角色或未知
                    // **********************************
                }));

                setAnnouncements(formattedData);
            } catch (err) {
                console.error('獲取公告失敗:', err);
                setError(`無法載入公告資料: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchAnnouncements();
    }, [limit]); 

    // --- 渲染載入和錯誤狀態 ---
    if (loading) return <div className="text-center py-8">載入中...</div>;
    if (error) return <div className="text-center py-8 text-red-500">錯誤: {error}</div>;

    // --- 列表主體渲染 ---
    return (
        <div className="space-y-4">
            <h1 className="text-3xl font-bold text-gray-800 mb-4 border-b-4 border-primary pb-2 inline-block">
                最新消息
            </h1>

            {announcements.length === 0 ? (
                <p>目前沒有任何公告。</p>
            ) : (
                <div className="divide-y divide-gray-200">
                    {announcements.map((ann) => (
                        <div key={ann.id} className="py-4 flex items-start">
                            <div className="text-gray-500 text-sm w-20 flex-shrink-0 pt-1">
                                {ann.dateOnly}
                            </div>

                            <div className="flex-grow pl-4 flex flex-col">
                                <div className="flex items-center space-x-3">
                                    {/* 標籤渲染 */}
                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                        ann.tag === '系統公告' 
                                            ? 'bg-purple-100 text-purple-600' 
                                            : 'bg-blue-100 text-blue-600'
                                    }`}>
                                        {ann.tag}
                                    </span>
                                    
                                    {/* 公告標題/點擊區域 */}
                                    <button 
                                        // 2. 點擊時呼叫 onSelectAnnouncement
                                        onClick={() => onSelectAnnouncement && onSelectAnnouncement(ann)}
                                        className="text-gray-800 hover:text-orange-600 font-medium text-left" 
                                    >
                                        {ann.title}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            {/* 3. 根據 isFullPage 決定是否顯示「查看更多」按鈕
            {!isFullPage && announcements.length > 0 && (
                <div className="text-center mt-6">
                    <a href="/news" className="text-blue-600 hover:text-blue-800 font-semibold">
                        查看更多公告 &rarr;
                    </a>
                </div>
            )} */}
        </div>
    );
}

export default AnnouncementList;