import { useState } from "react";
import { Link as RouterLink } from "react-router-dom"; 



function Footer() {
  
  // 底部導航連結列表 (Footer Links)
  const footerLinks = (
    <div className="space-x-4">

      {/* 內部路由連結 */}
      <a href="mailto:contact@openticket.com" className="hover:underline">聯絡信箱</a>
      <RouterLink to="/FAQList" className="hover:underline transition duration-150">常見問題</RouterLink>
      <RouterLink to="/Privacy" className="hover:underline transition duration-150">Privacy</RouterLink>
    </div>
  );

  return (
    <footer className="bg-text text-bg text-sm p-4 flex items-center justify-between font-sans">
      
      {/* 1. Logo 和版權文字 (左側) */}
      <div className="flex flex-col md:flex-row items-center space-y-1 md:space-y-0 md:space-x-6 w-full md:w-auto justify-center md:justify-start">
        <RouterLink to="/" className="text-sm font-bold text-primary">OpenTicket</RouterLink>
        <p className="text-bg">© 2025 OpenTicket. All rights reserved.</p>
      </div>
      
      {/* 2. 連結群組 (右側) */}
      <div className="hidden md:block">
        {footerLinks}
      </div>
    </footer>
  );
}

export default Footer;