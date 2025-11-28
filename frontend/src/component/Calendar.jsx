import React, { useState } from "react";
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
    getDay
} from "date-fns";
import "../Css/Calendar.css";

function Calendar() {
    const [currentDate, setCurrentDate] = useState(new Date());

    // 切換上一個月、下一個月
    const prevMonth = () => {
        setCurrentDate(subMonths(currentDate, 1));
    };

    const nextMonth = () => {
        setCurrentDate(addMonths(currentDate, 1));
    };

    // 產生整個月的日期格子
    const renderCells = () => {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(monthStart);

        const weekStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // 星期日開始
        const weekEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

        const days = [];
        let day = weekStart;

        while (day <= weekEnd) {
            const formatted = format(day, "d");
            const cloneDay = day;
            const dayOfWeek = getDay(day);
            
            // 判斷是否為週末（0=週日, 6=週六）
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            
            // 組合 CSS 類別
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

            days.push(
                <div
                    key={cloneDay.toString()}
                    className={dayClass}
                    onClick={() => console.log("clicked:", cloneDay)}
                >
                    {formatted}
                </div>
            );

            day = addDays(day, 1);
        }

        return days;
    };

    return (
        <div className="calendar-container">
            {/* 月份切換 */}
            <div className="calendar-header">
                <button onClick={prevMonth} className="calendar-nav-btn">
                    ← 上一個月
                </button>
                <h2>
                    {format(currentDate, "yyyy年 MM月")}
                </h2>
                <button onClick={nextMonth} className="calendar-nav-btn">
                    下一個月 →
                </button>
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

export default Calendar