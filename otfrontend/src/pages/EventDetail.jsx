import React, { useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Button } from "@/components/ui/button";
import Breadcrumb from "../components/Breadcrumb";
import EventHero from "../components/EventHero";
import EventShareActions from "../components/EventShareActions";
import EventDetailTabs from "../components/EventDetailTabs";
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
    return <div className="text-center py-12">載入中...</div>;
  }

  // 處理錯誤顯示
  if (error) {
    return (
      <div className="font-sans min-h-screen flex flex-col">
        <Header showSearchBar={true} />
        <main className="flex-1 flex flex-col items-center justify-center bg-bg px-6 py-12">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg shadow-sm max-w-md text-center">
            <h2 className="text-xl font-bold mb-2">無法載入活動</h2>
            <p>{error}</p>
            <Button 
              className="mt-4 bg-gray-600 hover:bg-gray-700 text-white"
              onClick={() => navigate("/events")}
            >
              返回活動列表
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
            className="bg-blue-600 text-white px-8 py-3 text-lg"
            onClick={handlePurchase}
          >
            立即購票
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
    </div>
  );
}
