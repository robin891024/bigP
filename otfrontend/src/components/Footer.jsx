import { useState } from "react";
import { Link as RouterLink } from "react-router-dom"; 
// 為了這個範例的獨立性，我會將所有的 Link/Button import 移除，
// 只保留 RouterLink (這是 Footer 實際需要的)
// import { Card, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Link as LinkIcon, Search } from "lucide-react"; 

/**
 * Footer 連結列表元件
 * * 備註：此組件在 md 螢幕以上顯示完整連結，在 md 螢幕以下只顯示 Logo 和版權。
 * 隱藏的連結必須手動整合到 Header 元件的移動選單中。
 */
function Footer() {
  
  // 底部導航連結列表 (Footer Links)
  const footerLinks = (
    <div className="space-x-4">
      {/* 外部信箱連結 */}
      <a href="mailto:contact@openticket.com" className="hover:underline transition duration-150">聯絡信箱</a>
      {/* 內部路由連結 */}
      <RouterLink to="/FAQList" className="hover:underline transition duration-150">常見問題</RouterLink>
      <RouterLink to="/Privacy" className="hover:underline transition duration-150">Privacy</RouterLink>
    </div>
  );

  return (
    <footer className="bg-text text-bg text-sm p-4 flex items-center justify-between">
      
      {/* 1. Logo 和版權文字 (左側) */}
      {/* 在 md 螢幕以下，使用 flex-col 和 text-center 讓它們垂直堆疊並置中，提供更好的行動體驗 */}
      <div className="flex flex-col md:flex-row items-center space-y-1 md:space-y-0 md:space-x-6 w-full md:w-auto justify-center md:justify-start">
        <RouterLink to="/" className="text-sm font-bold text-primary">OpenTicket</RouterLink>
        <p className="text-gray-400">© 2025 OpenTicket. All rights reserved.</p>
      </div>
      
      {/* 2. 連結群組 (右側) 
          使用 hidden md:block 確保只在 md 螢幕以上顯示連結
      */}
      <div className="hidden md:block">
        {footerLinks}
      </div>
    </footer>
  );
}

export default Footer;