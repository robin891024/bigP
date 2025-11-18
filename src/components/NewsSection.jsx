const newsData = [
    { date: "2025/10/27", type: "system", title: "【票券配送公告】2025 FireBall Fest. 火球祭", isSystem: false, id: 1 },
    { date: "2025/07/15", type: "system", title: "請慎防詐騙，切勿相信來路不明的客服通知", isSystem: true, id: 2 },
    { date: "2025/06/20", type: "system", title: "網站防護機制啟動說明", isSystem: true, id: 3 },
    { date: "2024/10/29", type: "system", title: "切勿向來源不明的管道提供您的訂購資訊及個人資料，請留意詐騙風險！", isSystem: true, id: 4 },
    { date: "2024/10/08", type: "system", title: "【系統公告】身心障礙者身份認證功能上線", isSystem: true, id: 5 },
];

/**
 * 渲染單一公告項目
 * @param {object} item - 公告數據
 */
const NewsItem = ({ item }) => {
    // 根據 isSystem 判斷標籤顏色：粉紫色（fuchsia-600/pink-600）或灰色（用於非系統公告的圓點）
    const tagColorClass = item.isSystem ? 'bg-fuchsia-600' : 'bg-gray-500';
    const tagText = item.isSystem ? '系統公告' : '票券配送公告';

    // 判斷連結文字顏色：圖片中標題顏色多為藍色
    const titleColorClass = item.isSystem ? 'text-blue-600' : 'text-fuchsia-700';
    
    // 非系統公告（圖中第一條）的標籤處理
    const isPrimaryAnnouncement = item.id === 1; // 假設第一條是特殊公告

    return (
        // 使用 flex-col 在小螢幕上保持單行，但主要用 items-center 對齊
        // border-b-1 實現底線分隔
        <div key={item.id} className="flex items-start py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors duration-150">
            
            {/* 1. 日期區塊：固定寬度，文字顏色較淡 */}
            <span className="text-sm text-gray-500 w-28 flex-shrink-0 pt-0.5">
                {item.date}
            </span>
            
            {/* 2. 內容區塊：使用 flex 排列標籤和標題，佔用剩餘空間 */}
            <div className="flex items-center space-x-2 flex-grow min-w-0">
                
                
                {/* 標籤 (Tag) */}
                {isPrimaryAnnouncement || item.isSystem ? (
                    <span className={`text-white text-xs px-2 py-0.5 rounded mr-1 flex-shrink-0 ${isPrimaryAnnouncement ? 'bg-blue-600' : 'bg-fuchsia-600'}`}>
                        {isPrimaryAnnouncement ? '票券配送公告' : tagText}
                    </span>
                ) : null}

                {/* 標題/連結文字 */}
                <a href={`/news/${item.id}`} className={`text-base hover:underline min-w-0 ${isPrimaryAnnouncement ? 'text-blue-600 font-semibold' : 'text-gray-800'}`}>
                    {item.title}
                </a>

            </div>
        </div>
    );
};


// 3. 消息列表主組件 (不再需要分欄邏輯)
const NewsSection = ({ data = newsData, isFullPage = false }) => {
    // 根據是否為全頁模式調整最大寬度
    const maxWidthClass = isFullPage ? 'max-w-4xl' : 'max-w-6xl'; 
    const paddingClass = isFullPage ? 'p-6' : 'py-8 px-4';

    return (
        <div className={`${maxWidthClass} mx-auto ${paddingClass} bg-white`}> 
            
            {/* 標題區塊 */}
            <h1 className="text-3xl font-bold text-gray-800 mb-8 border-b-4 border-primary pb-2 inline-block">最新消息</h1>
            

            {/* 公告列表容器 */}
            <div className="flex flex-col">
              
                {data.map((item) => (
                    <NewsItem key={item.id} item={item} />
                ))}
            </div>
            
        </div>
    );
};

export default NewsSection;