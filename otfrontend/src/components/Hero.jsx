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

// 動畫時間 (必須與 CSS transition 時間一致)
const SLIDE_DURATION = 500; // 0.5s

// 備用圖片（當 API 圖片載入失敗時使用）
const FALLBACK_IMAGES = [
    "/images/test.jpg",
];

function Hero() {
    const [query, setQuery] = useState("");
    const navigate = useNavigate();
    const [images, setImages] = useState([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    // [新增狀態] 追蹤使用者是否與輪播互動 (滑鼠移入或點擊)
    const [isInteracting, setIsInteracting] = useState(false);

    // 轉換 activeImages 為物件陣列格式 { id, imageUrl }
    const activeImages = images.length > 0
        ? images
        : FALLBACK_IMAGES.map(url => ({ id: null, imageUrl: url }));

    const imagesCount = activeImages.length;

    // 只有當至少有兩張圖片時，才需要複製實現無限循環
    const shouldClone = imagesCount > 1;

    // 修正 slides 列表的建立邏輯
    const slides = shouldClone
        ? [activeImages[imagesCount - 1], ...activeImages, activeImages[0]]
        : activeImages;

    const slidesCount = slides.length;

    const handleSearch = (e) => {
        e.preventDefault();
        const keyword = query.trim();
        if (keyword) {
            navigate(`/events?keyword=${encodeURIComponent(keyword)}`);
        } else {
            navigate('/events');
        }
    };

    // 圖片資料獲取邏輯 (不變)
    useEffect(() => {
        const fetchImages = async () => {
            try {
                const response = await fetch(REMOTE_API_ENDPOINT);

                if (!response.ok) {
                    throw new Error(`API Error: ${response.status}`);
                }

                const data = await response.json();

                const sortedEvents = data
                    .sort((a, b) => b.id - a.id)
                    .slice(0, 7);

                    const mappedImages = sortedEvents.map(event => {
                    const rawUrl = event.image || '/api/images/covers/test.jpg';
                    return {
                        id: event.id,
                        imageUrl: rawUrl,
                        title: event.title
                    };
                });

                if (mappedImages.length > 0) {
                    setImages(mappedImages);
                }
            } catch (error) {
                console.error("無法載入輪播圖片，使用 fallback 圖片。", error);
                const fallbackData = FALLBACK_IMAGES.map(url => ({ id: null, imageUrl: url, title: "Default Image" }));
                setImages(fallbackData);
            }
        };
        fetchImages();
    }, []);

    // 處理初始載入和重設時，從索引 0 瞬間跳轉到 1 (不變)
    useEffect(() => {
        if (imagesCount > 1 && currentImageIndex === 0) {
            const slider = document.getElementById('slider-track');
            if (slider) {
                slider.style.transition = 'none';
            }

            setCurrentImageIndex(1);

            setTimeout(() => {
                if (slider) {
                    slider.style.transition = `transform ${SLIDE_DURATION}ms ease-in-out`;
                }
            }, 50);
        }
    }, [imagesCount, currentImageIndex]);


    const goToSlide = useCallback((index) => {
        if (slidesCount <= 1) return;

        // 1. 正常切換到新索引
        setCurrentImageIndex(index);

        // 2. 判斷是否需要執行隱藏的「瞬間切換」
        let newIndex = index;

        if (index === slidesCount - 1) {
            newIndex = 1;
        }
        else if (index === 0) {
            newIndex = slidesCount - 2;
        }

        if (newIndex !== index) {
            setTimeout(() => {
                const slider = document.getElementById('slider-track');
                if (slider) {
                    slider.style.transition = 'none';
                }

                setCurrentImageIndex(newIndex);

                setTimeout(() => {
                    if (slider) {
                        slider.style.transition = `transform ${SLIDE_DURATION}ms ease-in-out`;
                    }
                }, 50);
            }, SLIDE_DURATION);
        }
    }, [slidesCount]);

    const goToPrev = () => {
        // [新增] 在點擊時設定為互動中，防止自動輪播立即覆蓋
        setIsInteracting(true);
        goToSlide(currentImageIndex - 1);
        // [新增] 點擊後短暫延遲後恢復自動輪播（模擬使用者完成操作）
        setTimeout(() => setIsInteracting(false), SLIDE_INTERVAL / 4);
    };

    const goToNext = () => {
        // [新增] 在點擊時設定為互動中
        setIsInteracting(true);
        goToSlide(currentImageIndex + 1);
        // [新增] 點擊後短暫延遲後恢復自動輪播
        setTimeout(() => setIsInteracting(false), SLIDE_INTERVAL / 4);
    };

    // 核心自動輪播邏輯
    useEffect(() => {
        // [修改條件] 只有在應該複製 (多圖) 且非互動中時才啟動定時器
        if (shouldClone && !isInteracting) {
            const timer = setInterval(() => {
                // 自動輪播時，只管增加索引，讓 goToSlide 處理瞬間跳轉
                setCurrentImageIndex((prevIndex) => {
                    const nextIndex = (prevIndex + 1);
                    // 為了確保瞬間跳轉邏輯在下一個 cycle 被觸發，這裡仍然需要調用 goToSlide 
                    // 但我們主要依賴 setCurrentImageIndex 來驅動 state
                    goToSlide(nextIndex);
                    return nextIndex;
                });
            }, SLIDE_INTERVAL);
            return () => clearInterval(timer);
        }
        // 如果 isInteracting 變為 true，定時器會被清除；
        // 如果 isInteracting 變為 false，定時器會被重新建立。
        return () => { }; // 清除舊定時器
    }, [shouldClone, goToSlide, isInteracting]);

    // 箭頭按鈕樣式 (不變)
    const arrowButtonClass = `
        absolute top-1/2 transform -translate-y-1/2 
        bg-gray-500 bg-opacity-40 hover:bg-opacity-60 
        text-white rounded-full z-30 transition cursor-pointer 
        flex items-center justify-center
        w-8 h-8 p-1.5 md:w-12 md:h-12 md:p-3
    `;

    // [新增] 處理滑鼠移入/移出事件的函數
    const handleMouseEnter = () => setIsInteracting(true);
    const handleMouseLeave = () => setIsInteracting(false);

    return (
        <section
            className="relative w-full flex flex-col justify-center items-center overflow-hidden bg-black"
            onMouseEnter={handleMouseEnter} // 滑鼠移入時暫停
            onMouseLeave={handleMouseLeave} // 滑鼠移出時恢復
        >

            {/* 【主容器】確保圖片不溢出：加上 overflow-hidden */}
            <div className="relative w-full overflow-hidden" style={{ paddingBottom: '43.53%' }}>

                <div
                    id="slider-track"
                    className="absolute inset-0 w-full h-full flex"
                    style={{
                        width: `${slidesCount * 100}%`,
                        transition: shouldClone ? `transform ${SLIDE_DURATION}ms ease-in-out` : 'none',
                        transform: `translateX(-${currentImageIndex * (100 / slidesCount)}%)`,
                    }}
                >
                    {slides.map((imgObj, index) => (
                        <div
                            key={index}
                            onClick={() => {
                                const targetId = (index === 0) 
                                    ? slides[slidesCount - 2].id 
                                    : (index === slidesCount - 1)
                                        ? slides[1].id 
                                        : imgObj.id; 
                                if (targetId) navigate(`/events/detail/${targetId}`);
                            }}
                            className="w-full h-full flex-shrink-0 flex items-center justify-center aspect-[85/37]"
                            style={{
                                width: `${100 / slidesCount}%`,
                                cursor: imgObj.id ? 'pointer' : 'default',
                                background: '#000',
                            }}
                        >
                            <img
                                src={imgObj.imageUrl.replace(/ /g, '%20')}
                                alt={imgObj.title || ''}
                                className="w-full h-full object-cover"
                                style={{ display: 'block', margin: '0 auto' }}
                                draggable={false}
                            />
                        </div>
                    ))}
                </div>

                {/* 左右箭頭 */}
                {shouldClone && (
                    <>
                        <div className={`${arrowButtonClass} left-2 md:left-4`} onClick={goToPrev}>
                            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <div className={`${arrowButtonClass} right-2 md:right-4`} onClick={goToNext}>
                            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                    </>
                )}

                {/* 內容層：搜尋框 (不變) */}
                {/* 為了不中斷 onMouseEnter/onMouseLeave，搜尋框被包含在 <section> 內 */}
                <div className="absolute inset-0 z-20 flex flex-col justify-end pb-8 md:justify-center md:pb-0 items-center w-full pointer-events-none">
                    <div className="pointer-events-auto relative bg-white rounded-full shadow-xl w-[80%] md:w-[600px] h-12 md:h-16 transition-all duration-300">
                        <form
                            onSubmit={handleSearch}
                            className="w-full h-full relative flex items-center"
                        >
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="w-full h-full bg-transparent outline-none text-gray-800 placeholder-gray-400 rounded-full
                                    pl-5 pr-14              
                                    text-base md:text-xl    
                                "
                                placeholder="搜尋活動"
                            />
                            <button
                                type="submit"
                                className="absolute right-1.5 top-1/2 transform -translate-y-1/2 
                                    bg-orange-500 hover:bg-orange-600 text-white rounded-full 
                                    flex items-center justify-center shadow-md transition duration-200
                                    w-9 h-9 md:w-14 md:h-14  
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