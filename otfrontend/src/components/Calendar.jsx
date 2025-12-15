import React, { useState, useEffect } from "react";
import {
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    addDays,
    addMonths,
    subMonths,
    format,
    isSameMonth,
    isSameDay,
    getDay,
    parseISO,
    isWithinInterval,
    isBefore,
    startOfDay
} from "date-fns";
import "../Css/Calendar.css";

function Calendar({ userId }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [wishlistEvents, setWishlistEvents] = useState([]);
    const [purchasedEvents, setPurchasedEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showEventList, setShowEventList] = useState(false);
    const [selectedDateEvents, setSelectedDateEvents] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);

    // 獲取使用者資料
    useEffect(() => {
        if (!userId) return;

        const fetchData = async () => {
            try {
                setLoading(true);

                // 獲取願望清單
                const wishlistRes = await fetch(
                    `http://localhost:8080/wishList/get?userId=${userId}`,
                    {
                        credentials: 'include'
                    }
                );
                if (!wishlistRes.ok) {
                    throw new Error(`願望清單 API 錯誤: ${wishlistRes.status}`);
                }
                const wishlistData = await wishlistRes.json();
                setWishlistEvents(wishlistData);

                // 獲取已購買訂單
                const purchasedRes = await fetch(
                    `http://localhost:8080/checkoutOrders/getAll?userId=${userId}`,
                    {
                        credentials: 'include'
                    }
                );
                if (!purchasedRes.ok) {
                    throw new Error(`訂單 API 錯誤: ${purchasedRes.status}`);
                }
                const purchasedData = await purchasedRes.json();
                setPurchasedEvents(purchasedData);

            } catch (error) {
                console.error('獲取日曆資料失敗:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userId]);

    // 檢查日期是否在活動範圍內
    const checkDateStatus = (date) => {
        const today = startOfDay(new Date());
        const checkDate = startOfDay(date);

        const isPast = isBefore(checkDate, today);

        const isPurchased = purchasedEvents.some(event => {
            if (!event.eventStartDate || !event.eventEndDate) return false;
            const start = parseISO(event.eventStartDate);
            const end = parseISO(event.eventEndDate);
            return isWithinInterval(checkDate, { start, end });
        });

        const isWishlisted = wishlistEvents.some(event => {
            if (!event.eventStartDate || !event.eventEndDate) return false;
            const start = parseISO(event.eventStartDate);
            const end = parseISO(event.eventEndDate);
            return isWithinInterval(checkDate, { start, end });
        });

        return {
            isPast,
            isPurchased,
            isWishlisted,
            isClickable: (isPurchased || isWishlisted) && !isPast
        };
    };

    // 處理日期點擊
    // 處理日期點擊
    const handleDateClick = (date, status) => {
        if (!status.isClickable) return;

        const relevantEvents = [];

        if (status.isPurchased) {
            const purchased = purchasedEvents.filter(event => {
                if (!event.eventStartDate || !event.eventEndDate) return false;
                const start = parseISO(event.eventStartDate);
                const end = parseISO(event.eventEndDate);
                return isWithinInterval(startOfDay(date), { start, end });
            });
            relevantEvents.push(...purchased.map(e => ({
                ...e,
                type: 'purchased',
                displayName: e.eventName,
                startDate: e.eventStartDate,
                endDate: e.eventEndDate,
                address: e.eventAddress || '地點未提供',
                eventId: e.eventId  // ✅ 加入 eventId
            })));
        }

        if (status.isWishlisted) {
            const wishlisted = wishlistEvents.filter(event => {
                if (!event.eventStartDate || !event.eventEndDate) return false;
                const start = parseISO(event.eventStartDate);
                const end = parseISO(event.eventEndDate);
                return isWithinInterval(startOfDay(date), { start, end });
            });
            relevantEvents.push(...wishlisted.map(e => ({
                ...e,
                type: 'wishlisted',
                displayName: e.eventName,
                startDate: e.eventStartDate,
                endDate: e.eventEndDate,
                address: e.eventAddress || '地點未提供',
                eventId: e.eventId
            })));
        }

        setSelectedDate(date);
        setSelectedDateEvents(relevantEvents);
        setShowEventList(true);
    };


    // 返回行事曆
    const handleBackToCalendar = () => {
        setShowEventList(false);
        setSelectedDateEvents([]);
        setSelectedDate(null);
    };

    // 切換月份
    const prevMonth = () => {
        setCurrentDate(subMonths(currentDate, 1));
    };

    const nextMonth = () => {
        setCurrentDate(addMonths(currentDate, 1));
    };

    // 產生日期格子
    const renderCells = () => {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(monthStart);
        const weekStart = startOfWeek(monthStart, { weekStartsOn: 0 });
        const weekEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

        const days = [];
        let day = weekStart;

        while (day <= weekEnd) {
            const formatted = format(day, "d");
            const cloneDay = day;
            const dayOfWeek = getDay(day);
            const status = checkDateStatus(day);

            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

            let dayClass = "calendar-day";

            if (!isSameMonth(day, monthStart)) {
                dayClass += " other-month";
            }
            if (isSameDay(day, new Date())) {
                dayClass += " today";
            }
            if (isWeekend) {
                dayClass += " weekend";
            }
            if (status.isPurchased) {
                dayClass += " purchased";
            }
            if (status.isWishlisted) {
                dayClass += " wishlisted";
            }
            if (status.isPast || !status.isClickable) {
                dayClass += " disabled";
            }

            days.push(
                <div
                    key={cloneDay.toString()}
                    className={dayClass}
                    onClick={() => handleDateClick(cloneDay, status)}
                    style={{
                        cursor: status.isClickable ? 'pointer' : 'not-allowed'
                    }}
                >
                    {formatted}
                </div>
            );

            day = addDays(day, 1);
        }

        return days;
    };

    // 渲染活動列表視圖
    // 渲染活動列表視圖
    const renderEventList = () => {
        return (
            <div className="event-list-container">
                <div className="event-list-header">
                    <button onClick={handleBackToCalendar} className="back-button">
                        <span className="material-symbols-outlined">arrow_back</span>
                        返回行事曆
                    </button>
                    <h2 className="event-list-title">
                        {format(selectedDate, "yyyy年 MM月 dd日")} 的活動
                    </h2>
                </div>

                <div className="event-list-content">
                    {selectedDateEvents.length === 0 ? (
                        <div className="empty-state">
                            <svg className="empty-state-icon" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z"></path>
                            </svg>
                            <div>
                                <p className="empty-state-title">此日期沒有活動</p>
                                <p className="empty-state-description">選擇其他有標記的日期查看活動</p>
                            </div>
                        </div>
                    ) : (
                        <div className="table-wrapper">
                            <table className="event-list-table">
                                <thead>
                                    <tr>
                                        <th></th>
                                        <th>活動名稱</th>
                                        <th className="table-column-date">活動日期</th>
                                        <th className="table-column-location">活動地點</th>
                                        <th className="table-column-type">類型</th>
                                        <th>活動連結</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedDateEvents.map((event, index) => (
                                        <tr key={index}>
                                            <td className="table-index">{index + 1}</td>
                                            <td className="table-event-name">{event.displayName}</td>
                                            <td className="table-info table-column-date">
                                                {format(parseISO(event.startDate), "yyyy/MM/dd")} - {format(parseISO(event.endDate), "yyyy/MM/dd")}
                                            </td>
                                            <td className="table-info table-column-location">
                                                {event.address || '地點未提供'}
                                            </td>
                                            <td className="table-column-type">
                                                <span className={`status-badge ${event.type}`}>
                                                    {event.type === 'purchased' ? '已購買' : '願望清單'}
                                                </span>
                                            </td>
                                            <td>
                                                <a
                                                    className="event-link"
                                                    href={`/events/detail/${event.eventId}`}
                                                >
                                                    查看活動
                                                </a>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        );
    };


    if (loading) {
        return (
            <div className="calendar-container">
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                    載入中...
                </div>
            </div>
        );
    }

    // 如果顯示活動列表,則渲染活動列表視圖
    if (showEventList) {
        return (
            <div className="calendar-container">
                {renderEventList()}
            </div>
        );
    }

    // 否則渲染行事曆視圖
    return (
        <div className="calendar-container">
            {/* 月份切換 */}
            <div className="calendar-header">
                <button onClick={prevMonth} className="calendar-nav-btn">
                    ← 上一個月
                </button>
                <h2>{format(currentDate, "yyyy年 MM月")}</h2>
                <button onClick={nextMonth} className="calendar-nav-btn">
                    下一個月 →
                </button>
            </div>

            {/* 圖例說明 */}
            <div className="calendar-legend">
                <div className="legend-item">
                    <span className="legend-color purchased"></span>
                    <span>已購買</span>
                </div>
                <div className="legend-item">
                    <span className="legend-color wishlisted"></span>
                    <span>願望清單</span>
                </div>
                <div className="legend-item">
                    <span className="legend-color both"></span>
                    <span>兩者皆有</span>
                </div>
            </div>

            {/* 星期列 */}
            <div className="calendar-weekdays">
                <div className="calendar-weekday">日</div>
                <div className="calendar-weekday">一</div>
                <div className="calendar-weekday">二</div>
                <div className="calendar-weekday">三</div>
                <div className="calendar-weekday">四</div>
                <div className="calendar-weekday">五</div>
                <div className="calendar-weekday">六</div>
            </div>

            {/* 日期格子 */}
            <div className="calendar-days">
                {renderCells()}
            </div>
        </div>
    );
}

export default Calendar;
