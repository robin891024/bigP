// src/pages/EventDetail.jsx

import React, { useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";

import Header from "../components/Header";
import Footer from "../components/Footer";
import Breadcrumb from "../components/Breadcrumb";
import EventHero from "../components/EventHero";
import EventShareActions from "../components/EventShareActions";
import EventDetailTabs from "../components/EventDetailTabs";
import { Button } from "@/components/ui/button";
import Top from "../components/ui/Top";

import { useEventDetail } from "../hooks/useEventDetail";
import { useToast } from "../components/ToastContext";


export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  
  const {
    event,
    isFavorited,
    setIsFavorited,
    loading,
    error, // 接收錯誤狀態
    memberId,
    isLoggedIn
  } = useEventDetail(id);  // 若從登入頁帶著 goTicket=1 返回且已登入，直接導向購票
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (isLoggedIn && params.get('goTicket') === '1' && event) {
      navigate(`/Ticket?eventId=${event.id}`, { replace: true });
    }
  }, [isLoggedIn, location.search, event, navigate]);

  if (loading) {
    return (
      <div className="font-sans min-h-screen flex flex-col">
        <Header showSearchBar={true} />
        <div className="max-w-7xl mx-auto w-full px-0 py-0">
          <div className="h-6 w-48 skeleton my-4 mx-4 rounded" />
        </div>
        {/* 骨架屏 Hero */}
        <div className="w-full bg-gray-200 relative overflow-hidden" style={{ minHeight: '320px' }}>
          <div className="relative flex flex-col items-center justify-center z-20 w-full">
            <div className="relative w-full aspect-[85/37] max-w-4xl mx-auto mt-4 rounded shadow-lg skeleton" />
            <div className="h-8 w-64 skeleton mt-4 mb-2 rounded" />
          </div>
        </div>
        <main className="flex-1 bg-bg px-0 py-0 max-w-7xl mx-auto w-full">
          <div className="flex justify-center gap-4 mt-4 px-4">
            <div className="h-12 w-40 skeleton rounded-md" />
          </div>
          <div className="flex justify-center gap-6 mt-6">
            <div className="h-6 w-20 skeleton rounded" />
            <div className="h-6 w-20 skeleton rounded" />
          </div>
          <div className="mt-8 px-4">
            <div className="h-10 w-full skeleton rounded mb-4" />
            <div className="space-y-2">
              <div className="h-4 w-full skeleton rounded" />
              <div className="h-4 w-full skeleton rounded" />
              <div className="h-4 w-3/4 skeleton rounded" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // 處理錯誤顯示
  if (error) {
    return (
      <div className="font-sans min-h-screen flex flex-col">
        <Header showSearchBar={true} />
        <main className="flex-1 flex flex-col items-center justify-center bg-bg px-6 py-12">
          <div className="bg-white border border-gray-200 px-10 py-12 rounded-xl shadow-lg max-w-lg text-center">
            <div className="text-orange-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 15c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">活動資訊提示</h2>
            <p className="text-gray-600 mb-8 text-lg leading-relaxed">
              {error}
            </p>
            <Button 
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-6 text-lg font-semibold rounded-lg transition-colors"
              onClick={() => navigate("/events")}
            >
              查看其他熱門活動
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!event) {
    navigate("/events", { replace: true });
    return null;
  }

  const handlePurchase = () => {
    if (!isLoggedIn) {
      let countdown = 3;
      let timer = null;
      
      const handleClick = () => {
        // 清除倒數計時器
        if (timer) clearInterval(timer);
        navigate('/login', { state: { redirect: `/events/detail/${event.id}?goTicket=1` } });
      };
      
      showToast(`請先登入再購票，${countdown}秒後跳轉...`, handleClick);
      
      timer = setInterval(() => {
        countdown--;
        if (countdown > 0) {
          showToast(`請先登入再購票，${countdown}秒後跳轉...`, handleClick);
        } else {
          clearInterval(timer);
          navigate('/login', { state: { redirect: `/events/detail/${event.id}?goTicket=1` } });
        }
      }, 1000);
      
      return;
    }
    navigate(`/Ticket?eventId=${event.id}`);
  };

  return (
    <div className="font-sans min-h-screen flex flex-col">
      <Header showSearchBar={true} />
      {/* 麵包屑 */}
      <div className="max-w-7xl mx-auto w-full px-0 py-0">
        <Breadcrumb
          items={[
            { label: "首頁", to: "/" },
            { label: "活動資訊", to: "/events" },
            { label: event.title }
          ]}
        />
      </div>
      {/* 主視覺 */}
      <EventHero image={event.image} title={event.title} />
      <main className="flex-1 bg-bg px-0 py-0 max-w-7xl mx-auto w-full">
        {/* 立即購票按鈕 */}
        <div className="flex justify-center gap-4 mt-4 px-4">
          <Button
            className={`${
              event.statusId === 4 
                ? "bg-blue-600 hover:bg-blue-700" 
                : "bg-gray-400 cursor-not-allowed"
            } text-white px-8 py-3 text-lg`}
            onClick={event.statusId === 4 ? handlePurchase : null}
            disabled={event.statusId !== 4}
          >
            {event.statusId === 4 
              ? "立即購票" 
              : event.statusId === 1 
                ? "尚未開放" 
                : "尚未開放"}
          </Button>
        </div>
        {/* 收藏與分享按鈕 */}
        <EventShareActions
          isFavorited={isFavorited}
          isLoggedIn={isLoggedIn}
          memberId={memberId}
          eventId={id}
          onFavoriteChange={setIsFavorited}
        />
        {/* 活動說明 */}
        <EventDetailTabs eventId={event.id} />
      </main>
      <Footer />
      <Top />
    </div>
  );
}
