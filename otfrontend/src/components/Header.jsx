import React, { useState } from 'react';
import { Link } from 'react-router-dom'; 
import { Button } from "@/components/ui/button";
import { Search, Menu, X } from 'lucide-react'; // 引入 Menu 和 X 圖標

function Header({ showSearchBar = false }) {
  // 用於管理移動端選單的開/關狀態
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  // 導航連結列表 (用於重複使用在 Header 和 Mobile Menu 中)
  // 注意：會員資訊 (Link to "/login") 在桌面版會被移到右側功能群組
  const primaryNavLinks = (
    <>
      <Link to="/events" className="hover:underline transition duration-150 py-2 md:py-0" onClick={() => setIsMenuOpen(false)}>活動資訊</Link>
      <Link to="/news" className="hover:underline transition duration-150 py-2 md:py-0" onClick={() => setIsMenuOpen(false)}>最新消息</Link>
    </>
  );

  return (
    <header className="sticky top-0 z-50 bg-text text-bg shadow-lg">
      <div className="flex justify-between items-center max-w-7xl mx-auto px-6 py-3">
        
        {/* 左側群組：Logo + 主要連結 */}
        <div className="flex items-center space-x-6">
            {/* Logo 連結到首頁 (始終顯示) */}
            <Link to="/" className="text-2xl font-extrabold text-primary font-sans" onClick={() => setIsMenuOpen(false)}>OpenTicket</Link>

            {/* 桌面端：主要導航 (md 螢幕以上顯示) */}
            <nav className="hidden md:flex items-center space-x-6">
                {primaryNavLinks}
            </nav>
        </div>


        {/* 桌面端：右側功能群組 (md 螢幕以上顯示) 
            排列順序: [搜尋欄] [會員資訊] [登入/註冊按鈕] 
        */}
        <div className="hidden md:flex items-center space-x-4">
          
          {/* 1. 搜尋欄 */}
          {showSearchBar && (
            <div className="relative w-64">
              <input 
                type="text" 
                placeholder="搜尋活動"
                className="w-full py-1.5 pl-9 pr-3 text-sm rounded-full bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition" 
              />
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          )}
          
          {/* 2. 會員資訊連結 */}
          <Link to="/login" className="hover:underline transition duration-150">會員資訊</Link> 

          {/* 3. 登入/註冊按鈕 */}
          <Button variant="secondary" className="ml-2">
            <Link to="/login" className="text-text font-semibold">登入/註冊</Link>
          </Button>
        </div>

        {/* 移動端：漢堡選單按鈕 (md 螢幕以下顯示) */}
        <button 
          className="md:hidden p-2 rounded-md hover:bg-gray-800 transition"
          onClick={toggleMenu}
          aria-label="Toggle Menu"
        >
          <Menu size={28} className="text-primary" />
        </button>

      </div>

      {/* -------------------- 移動端側邊選單 (Off-Canvas) -------------------- */}
      {isMenuOpen && (
        // 選單背景/遮罩
        <div 
          className="fixed inset-0 bg-black/70 z-50 md:hidden" 
          onClick={toggleMenu} // 點擊遮罩關閉選單
        >
          {/* 選單本體 */}
          <div 
            className={`fixed top-0 left-0 w-3/4 h-full bg-white text-gray-900 shadow-2xl transform transition-transform duration-300 ease-in-out ${
              isMenuOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
            onClick={(e) => e.stopPropagation()} // 防止點擊選單內容時關閉選單
          >
            {/* 選單頂部：Logo 與關閉按鈕 */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <Link to="/" className="text-xl font-extrabold text-primary">OpenTicket</Link>
              <button 
                className="p-1 rounded-full hover:bg-gray-100"
                onClick={toggleMenu}
                aria-label="Close Menu"
              >
                <X size={24} className="text-gray-600" />
              </button>
            </div>

            {/* 選單主體：連結列表 */}
            <nav className="flex flex-col p-6 space-y-2 text-base font-medium">
              {/* 移動端顯示所有連結，包括會員資訊 */}
              {primaryNavLinks}
              <Link to="/login" className="hover:underline transition duration-150 py-2" onClick={() => setIsMenuOpen(false)}>會員資訊</Link> 
              <div className="border-t border-gray-200 mt-2 pt-2">
                <a href="mailto:contact@openticket.com" className="block hover:underline transition duration-150 py-2" onClick={() => setIsMenuOpen(false)}>聯絡信箱</a>
                <Link to="/FAQList" className="block hover:underline transition duration-150 py-2" onClick={() => setIsMenuOpen(false)}>常見問題</Link>
                <Link to="/Privacy" className="block hover:underline transition duration-150 py-2" onClick={() => setIsMenuOpen(false)}>Privacy</Link>
              </div>
            
            </nav>

            {/* 登入/註冊按鈕 (移動端獨有) */}
            <div className="p-6 pt-0">
              <Button 
                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold"
                onClick={() => {
                  setIsMenuOpen(false);
                }}
              >
                <Link to="/login" className="w-full text-white">登入/註冊</Link>
              </Button>
            </div>

            {/* 搜尋欄 (移動端顯示) */}
            {showSearchBar && (
              <div className="p-6 pt-0">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="搜尋活動..."
                    className="w-full py-2 pl-10 pr-4 rounded-lg bg-gray-100 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary transition" 
                  />
                  <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;