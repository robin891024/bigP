import React, { useState , useEffect} from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import { Button } from "@/components/ui/button";
import { Search, Menu, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

function Header({ showSearchBar = false }) {
  // *********** 模擬登入狀態：使用 會員名稱 ***********
  const { isLoggedIn, userName, logout , isLoading, userRole} = useAuth(); // <-- 從 useAuth 獲取 userRole
  // console.log('Header State:', { isLoggedIn, userName, isLoading });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const navigate = useNavigate();

  const isAdmin = isLoggedIn && (userRole === 0 || userRole === 1);
  const ADMIN_DASHBOARD_URL = "http://localhost:8081/admin/dashboard";
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleAuthClick = () => {
    setIsMenuOpen(false);
    if (isLoggedIn) {
      logout(); 
      // navigate("/");
    } else {
      navigate("/login");
    }
  };
  // 2. 新增 useEffect 監聽 isLoggedIn 狀態
  // useEffect(() => {
  //   // 檢查狀態是否從登入轉變為登出 (且頁面不在首頁時才導航，避免無限迴圈)
  //   if (!isLoggedIn && !isLoading && window.location.pathname !== '/') {
  //     navigate("/");
  //   }
  // }, [isLoggedIn, isLoading, navigate]); // 依賴 isLoggedIn, isLoading, navigate
  // 如果正在載入中，可以選擇返回一個載入中的 Header，或返回 null
  if (isLoading) {
    // 載入時可以顯示一個簡化的 Header，避免內容閃爍
    return (
    <header className="sticky top-0 z-50 bg-text text-bg shadow-lg font-sans">
      <div className="flex justify-between items-center max-w-7xl mx-auto px-6 py-3">
      <Link to="/" className="text-2xl font-extrabold text-primary font-sans">OpenTicket</Link>
      <div className="animate-pulse bg-gray-700 h-8 w-20 rounded"></div>
      </div>
    </header>
    );
  }


  const primaryNavLinks = (
    <>
      <Link to="/events" className="hover:underline transition duration-150 py-2 md:py-0" onClick={() => setIsMenuOpen(false)}>活動資訊</Link>
      <Link to="/news" className="hover:underline transition duration-150 py-2 md:py-0" onClick={() => setIsMenuOpen(false)}>最新消息</Link>
    </>
  );

  return (
    <header className="sticky top-0 z-50 bg-text text-bg shadow-lg font-sans">
      <div className="flex justify-between items-center max-w-7xl mx-auto px-6 py-3">
        
        {/* 桌面端導航區塊 (保持不變) */}
        <div className="flex items-center space-x-6">
          <Link to="/" className="text-2xl font-extrabold text-primary font-sans" onClick={() => setIsMenuOpen(false)}>OpenTicket</Link>
          <nav className="hidden md:flex items-center space-x-6">
              {primaryNavLinks}
          </nav>
        </div>

        {/* 桌面端右側群組 (保持不變) */}
        <div className="hidden md:flex items-center space-x-4">
          {showSearchBar && (
            <div className="relative w-64">
              <input
                type="text"
                placeholder="搜尋活動"
                className="w-full py-1.5 pl-9 pr-3 text-sm rounded-full bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                value={searchValue}
                onChange={e => setSearchValue(e.target.value)}
                onCompositionStart={() => setIsComposing(true)}
                onCompositionEnd={() => setIsComposing(false)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !isComposing) {
                    const keyword = searchValue.trim();
                    if (keyword) {
                      navigate(`/events?keyword=${encodeURIComponent(keyword)}`);
                    } else {
                      navigate('/events');
                    }
                  }
                }}
                aria-label="搜尋活動"
              />
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                onClick={() => {
                  const keyword = searchValue.trim();
                  if (keyword) {
                    navigate(`/events?keyword=${encodeURIComponent(keyword)}`);
                  } else {
                    navigate('/events');
                  }
                }}
              />
            </div>
          )}
          
          {/* 【修改點】桌面端顯示用戶名，只有登入時顯示 */}
          {/* 【桌面端修改：用戶名和後台連結】 */}
          {isLoggedIn && userName && (
            <div className="flex items-center space-x-4">
            {/* 後台管理連結 (在用戶名左邊，僅管理員顯示) */}
            {isAdmin && (
              <a 
              href={ADMIN_DASHBOARD_URL}
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:underline transition duration-150 font-semibold text-primary/80"
              >
              後台管理系統
              </a>
            )}
            {/* 用戶名連結 */}
            <Link to="/member/info" className="hover:underline transition duration-150 font-semibold">{userName}</Link>
            </div>
          )}

          <Button variant="secondary" className="ml-2" onClick={handleAuthClick}>
            <span className="text-text font-semibold">
              {isLoggedIn ? '登出' : '登入/註冊'}
            </span>
          </Button>
        </div>

        {/* 移動端：漢堡選單按鈕 (保持不變) */}
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
        <div 
          className="fixed inset-0 bg-black/70 z-50 md:hidden" 
          onClick={toggleMenu}
        >
          {/* 選單本體 */}
          <div 
            className={`fixed top-0 left-0 w-3/4 h-screen overflow-y-auto bg-white text-gray-900 shadow-2xl transform transition-transform duration-300 ease-in-out ${
              isMenuOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* **** 修正區塊 1: 頂部 Logo 與關閉按鈕 (保持在同一行) **** */}
            <div className="flex justify-between items-center p-6 pb-2 border-b border-gray-200">
              {/* Logo */}
              <Link to="/" className="text-xl font-extrabold text-primary" onClick={() => setIsMenuOpen(false)}>OpenTicket</Link>
              
              {/* 關閉按鈕 */}
              <button 
                className="p-1 rounded-full hover:bg-gray-100"
                onClick={toggleMenu}
                aria-label="Close Menu"
              >
                <X size={24} className="text-gray-600" />
              </button>
            </div>
            
            {/* **** 修正區塊 2: 獨立的會員名稱區域 (只在登入後顯示) **** */}
            {isLoggedIn && userName && ( // 確保登入且有用戶名才顯示
              <div className="px-6 pt-4 pb-2 border-b border-gray-100">
                {/* 用戶名 */}
                <Link
                to="/member/info" 
                className="block text-xl font-semibold text-gray-700 hover:text-primary transition"
                onClick={() => setIsMenuOpen(false)}
                >
                {userName}
                </Link>
                
                {/* 後台管理連結 (在用戶名下方，僅管理員顯示) */}
                {isAdmin && (
                <a 
                  href={ADMIN_DASHBOARD_URL} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block text-base font-semibold text-primary hover:text-primary/80 transition mt-2" // 調整字體大小和間距
                  onClick={() => setIsMenuOpen(false)}
                >
                  後台管理系統
                </a>
                )}
              </div>
              )}
            {/* ******************************************************** */}

            {/* 選單主體：連結列表 */}
            <nav className="flex flex-col p-6 pt-4 space-y-2 text-base font-medium">
              {primaryNavLinks}

              {/* 注意: 這裡的 "會員資訊" 連結只有在登入前隱藏, 登入後才會顯示在列表中 (因為頂部已經有一個連結了)
              {isLoggedIn && (
                 <Link to="/member/info" className="hover:underline transition duration-150 py-2" onClick={() => setIsMenuOpen(false)}>會員資訊</Link>
              )} */}
              
              <div className="border-t border-gray-200 mt-2 pt-2">
                <a href="mailto:contact@openticket.com" className="block hover:underline transition duration-150 py-2" onClick={() => setIsMenuOpen(false)}>聯絡信箱</a>
                <Link to="/FAQList" className="block hover:underline transition duration-150 py-2" onClick={() => setIsMenuOpen(false)}>常見問題</Link>
                <Link to="/Privacy" className="block hover:underline transition duration-150 py-2" onClick={() => setIsMenuOpen(false)}>Privacy</Link>
              </div>
            </nav>

            
            
             {/* 搜尋欄 (移動端顯示) */}
            {showSearchBar && (
              <div className="p-6 pt-0">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="搜尋活動..."
                    className="w-full py-2 pl-10 pr-4 rounded-lg bg-gray-100 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary transition"
                    value={searchValue}
                    onChange={e => setSearchValue(e.target.value)}
                    onCompositionStart={() => setIsComposing(true)}
                    onCompositionEnd={() => setIsComposing(false)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !isComposing) {
                        const keyword = searchValue.trim();
                        if (keyword) {
                          navigate(`/events?keyword=${encodeURIComponent(keyword)}`);
                        } else {
                          navigate('/events');
                        }
                        setIsMenuOpen(false);
                      }
                    }}
                    aria-label="搜尋活動"
                  />
                  <Search
                    size={20}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer"
                    onClick={() => {
                      const keyword = searchValue.trim();
                      if (keyword) {
                        navigate(`/events?keyword=${encodeURIComponent(keyword)}`);
                      } else {
                        navigate('/events');
                      }
                      setIsMenuOpen(false);
                    }}
                  />
                </div>
              </div>
            )}

            {/* 登入/註冊 或 登出 按鈕 (移動端獨有, 保持不變) */}
            <div className="p-6 pt-0">
              <Button 
                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold"
                onClick={handleAuthClick}
              >
                <span className="w-full text-white">
                  {isLoggedIn ? '登出' : '登入/註冊'}
                </span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;