import { useState, useEffect } from 'react';

export const useDarkMode = () => {
    // 從 localStorage 讀取用戶偏好，如果沒有則使用系統偏好
    const [isDark, setIsDark] = useState(() => {
        const saved = localStorage.getItem('darkMode');
        if (saved !== null) {
            return saved === 'true';
        }
        // 檢查系統偏好
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    useEffect(() => {
        // 更新 document 的 class
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        // 儲存到 localStorage
        localStorage.setItem('darkMode', isDark);
    }, [isDark]);

    const toggleDarkMode = () => {
        setIsDark(prev => !prev);
    };

    return [isDark, toggleDarkMode];
};