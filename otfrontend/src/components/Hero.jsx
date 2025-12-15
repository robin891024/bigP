import { useState, useEffect, useCallback } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

// =========================================================
// 【輪播配置】- 圖片來源設定
// =========================================================

// 後端 API 配置
const REMOTE_API_BASE_URL = 'http://localhost:8080';
const REMOTE_API_ENDPOINT = `${REMOTE_API_BASE_URL}/api/events`;

// 輪播切換速度：8000ms = 8秒自動切換一次
const SLIDE_INTERVAL = 8000;

// 備用圖片（當 API 圖片載入失敗時使用）
const FALLBACK_IMAGES = [
    "https://static.tixcraft.com/images/banner/image_ad2afde95404171db0d1a5eb3d307790.jpg",
];

function Hero() {
    const [query, setQuery] = useState("");
    const navigate = useNavigate();
    const [images, setImages] = useState([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // 轉換 activeImages 為物件陣列格式 { id, imageUrl }
    const activeImages = images.length > 0 
        ? images 
        : FALLBACK_IMAGES.map(url => ({ id: null, imageUrl: url }));
        
    const imagesCount = activeImages.length;

    const handleSearch = (e) => {
        e.preventDefault();
        const keyword = query.trim();
        if (keyword) {
            navigate(`/events?keyword=${encodeURIComponent(keyword)}`);
        } else {
            navigate('/events');
        }
    };

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const response = await fetch(REMOTE_API_ENDPOINT);
                
                // 檢查回應狀態，若非 200 OK 則拋出錯誤
                if (!response.ok) {
                    throw new Error(`API Error: ${response.status}`);
                }

                const data = await response.json();
                
                // 取得當前時間
                const now = new Date();
                
                // 1. 計算與現在時間的差距 (絕對值)
                // 2. 依差距排序 (最接近現在的在前)
                // 3. 取前 7 筆
                const sortedEvents = data
                    .map(event => ({
                        ...event,
                        eventDate: new Date(event.eventStart),
                        diff: Math.abs(new Date(event.eventStart) - now)
                    }))
                    .sort((a, b) => a.diff - b.diff)
                    .slice(0, 7);

                // 轉換格式
                const mappedImages = sortedEvents.map(event => {
                    // 確保 imageUrl 存在，若不存在則使用預設圖
                    const rawUrl = event.imageUrl || '/api/images/covers/test.jpg';
                    
                    return {
                        id: event.id,
                        imageUrl: rawUrl.startsWith('http') 
                            ? rawUrl 
                            : `${REMOTE_API_BASE_URL}${rawUrl}`,
                        title: event.title
                    };
                });

                if (mappedImages.length > 0) {
                    setImages(mappedImages);
                }
            } catch (error) {
                console.error("無法載入輪播圖片，使用 fallback 圖片。", error);
                // 發生錯誤時，強制使用 Fallback 圖片
                // 這裡將 Fallback 圖片轉換為與正常圖片相同的物件結構，id 為 null 代表不可點擊
                const fallbackData = FALLBACK_IMAGES.map(url => ({ 
                    id: null, 
                    imageUrl: url,
                    title: "Default Image"
                }));
                setImages(fallbackData);
            }
        };
        fetchImages();
    }, []);

    const goToSlide = useCallback((index) => {
        let newIndex = index;
        if (newIndex >= imagesCount) newIndex = 0;
        else if (newIndex < 0) newIndex = imagesCount - 1;
        setCurrentImageIndex(newIndex);
    }, [imagesCount]);

    const goToPrev = () => goToSlide(currentImageIndex - 1);
    const goToNext = () => goToSlide(currentImageIndex + 1);

    useEffect(() => {
        if (imagesCount > 1) {
            const timer = setInterval(() => {
                setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imagesCount);
            }, SLIDE_INTERVAL);
            return () => clearInterval(timer);
        }
    }, [imagesCount, SLIDE_INTERVAL]);

    // 箭頭按鈕樣式
    const arrowButtonClass = `
        absolute top-1/2 transform -translate-y-1/2 
        bg-gray-500 bg-opacity-40 hover:bg-opacity-60 
        text-white rounded-full z-30 transition cursor-pointer 
        flex items-center justify-center
        w-8 h-8 p-1.5 md:w-12 md:h-12 md:p-3
    `;

    return (
        <section className="relative w-full flex flex-col justify-center items-center overflow-hidden bg-black">
            
            {/* 
            【主容器】
            - w-full: 寬度 100% 配合視窗寬度
            - paddingBottom: 43.53% = 根據圖片比例 850:370 計算（370÷850×100）
            - 使用 padding-bottom 技巧保持寬高比，讓容器自動計算高度
            */}
            <div className="relative w-full" style={{ paddingBottom: '43.53%' }}>
                
                {/* 
                【背景圖片層】
                - 疊加所有圖片，通過 opacity 控制顯示/隱藏
                - 使用淡入淡出動畫 (transition: opacity 1s)
                */}
                <div className="absolute inset-0 z-0 w-full h-full">
                    {activeImages.map((imgObj, index) => (
                        <div
                            key={index}
                            onClick={() => {
                                if (imgObj.id) navigate(`/events/detail/${imgObj.id}`);
                            }}
                            className={`w-full h-full absolute top-0 left-0 ${imgObj.id ? 'cursor-pointer' : ''}`}
                            style={{
                                // 設定背景圖片
                                backgroundImage: `url(${imgObj.imageUrl})`,
                                // contain: 完整顯示圖片，不切邊（可能有空白）
                                backgroundSize: 'contain',
                                // 圖片居中
                                backgroundPosition: 'center',
                                // 不重複平鋪
                                backgroundRepeat: 'no-repeat',
                                // 淡入淡出動畫 1 秒
                                transition: 'opacity 1s ease-in-out',
                                // 當前圖片顯示（opacity=1），其他隱藏（opacity=0）
                                opacity: index === currentImageIndex ? 1 : 0,
                                // 只有當前圖片可以接收點擊事件，避免被上層透明圖片遮擋
                                pointerEvents: index === currentImageIndex ? 'auto' : 'none',
                            }}
                        />
                    ))}
                </div>

                {/* 左右箭頭 */}
                {imagesCount > 1 && (
                    <>
                        <div className={`${arrowButtonClass} left-2 md:left-4`} onClick={goToPrev}>
                            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <div className={`${arrowButtonClass} right-2 md:right-4`} onClick={goToNext}>
                            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                    </>
                )}

                {/* 內容層：搜尋框 
                   使用 pointer-events-none 讓這個滿版圖層不擋住箭頭點擊
                   內部實際內容再開 pointer-events-auto
                */}
                <div className="absolute inset-0 z-20 flex flex-col justify-end pb-8 md:justify-center md:pb-0 items-center w-full pointer-events-none">
                    
                    {/* 搜尋框外層容器 (白色膠囊)
                        這裡設定了寬度：手機 80%，桌機 600px
                        這裡設定了高度：手機 3rem (h-12)，桌機 4rem (h-16)
                    */}
                    <div className="pointer-events-auto relative bg-white rounded-full shadow-xl w-[80%] md:w-[600px] h-12 md:h-16 transition-all duration-300">
                        <form
                            onSubmit={handleSearch}
                            className="w-full h-full relative flex items-center"
                        >
                            {/* 輸入框：背景透明，這樣才看得到外層的圓角白色 */}
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="w-full h-full bg-transparent outline-none text-gray-800 placeholder-gray-400 rounded-full
                                    pl-5 pr-14              /* 右邊 padding 留給按鈕 */
                                    text-base md:text-xl    /* 字體大小響應式 */
                                "
                                placeholder="搜尋活動"
                            />
                            
                            {/* 搜尋按鈕：使用 absolute 定位固定在右邊，確保不跑版 */}
                            <button
                                type="submit"
                                className="absolute right-1.5 top-1/2 transform -translate-y-1/2 
                                    bg-orange-500 hover:bg-orange-600 text-white rounded-full 
                                    flex items-center justify-center shadow-md transition duration-200
                                    w-9 h-9 md:w-14 md:h-14  /* 按鈕大小響應式 */
                                "
                            >
                                <Search className="w-5 h-5 md:w-7 md:h-7" />
                            </button>
                        </form>
                    </div>

                </div>
            </div>
        </section>
    );
}

export default Hero;