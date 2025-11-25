import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Button } from "@/components/ui/button";
import Breadcrumb from "../components/Breadcrumb";
import EventIntro from "../components/EventIntro";
import EventNote from "../components/EventNote";
import React from "react";


export default function EventDetail() {

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    fetch("/api/events")
      .then(res => {
        if (!res.ok) throw new Error("活動資料取得失敗");
        return res.json();
      })
      .then(data => {
        setEvents(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const event = events.find(e => String(e.id) === String(id));

  if (loading) {
    return <div className="text-center py-12">載入中...</div>;
  }
  
  // 如果找不到活動，導回 /events
  if (!event) {
    navigate("/events", { replace: true });
    return null;
  }

  return (
    <div className="font-sans min-h-screen flex flex-col">
      <Header showSearchBar={true} />

      <main className="flex-1 bg-bg px-0 py-0 max-w-7xl mx-auto w-full">
        {/* 麵包屑 */}
        <Breadcrumb
          items={[
            { label: "首頁", to: "/" },
            { label: "活動資訊", to: "/events" },
            { label: event.title }
          ]}
        />

        {/* 主視覺與按鈕 */}
        <div className="relative overflow-hidden pb-3" style={{ minHeight: '320px' }}>
          <div className="absolute inset-0 w-full h-full z-0" aria-hidden="true">
            <img
              src={event.image}
              alt="背景模糊"
              className="w-full h-full object-cover blur-lg scale-100"
              style={{ position: 'absolute', inset: 0, zIndex: 0 }}
            />
            <div
              className="absolute inset-0 w-full h-full"
              style={{
                backgroundImage: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.9))',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                zIndex: 1,
              }}
            />
          </div>
          <div className="relative flex flex-col items-center justify-center z-20">
            <img src={event.image} alt={event.title} className="max-w-2xl w-full rounded shadow-lg mt-4" style={{ background: '#222' }} />
            <div className="text-2xl md:text-3xl font-bold text-white text-center mt-4 mb-2 drop-shadow-lg">
              {event.title}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-4 mt-4 px-4">
          <Button className="bg-blue-600 text-white px-8 py-3 text-lg">立即購票</Button>
        </div>

        {/* 活動說明區塊（組件化） */}
        <EventDetailTabs eventId={event.id} />
      </main>
      <Footer />
    </div>
  );
}

// 分頁切換區塊組件
function EventDetailTabs({ eventId }) {
  const [tab, setTab] = React.useState('intro');
  return (
    <div className="bg-white mt-0 px-4 md:px-12 py-8">
      <div className="sticky top-0 bg-white z-10 flex border-b border-gray-300 mb-6 overflow-x-auto">
        <button
          className={`px-4 py-2 text-lg font-bold border-b-2 transition-colors duration-150 whitespace-nowrap ${tab === 'intro' ? 'text-blue-800 border-blue-700' : 'text-gray-500 border-transparent hover:text-blue-700'}`}
          onClick={() => setTab('intro')}
          aria-selected={tab === 'intro'}
          aria-controls="intro"
          id="tab-intro"
          type="button"
        >
          活動介紹
        </button>
        <button
          className={`px-4 py-2 text-lg font-bold border-b-2 transition-colors duration-150 whitespace-nowrap ${tab === 'note' ? 'text-blue-800 border-blue-700' : 'text-gray-500 border-transparent hover:text-blue-700'}`}
          onClick={() => setTab('note')}
          aria-selected={tab === 'note'}
          aria-controls="note"
          id="tab-note"
          type="button"
        >
          注意事項
        </button>
      </div>
      <div id="intro" hidden={tab !== 'intro'}>
        <EventIntro eventId={eventId} />
      </div>
      <div id="note" hidden={tab !== 'note'}>
        <EventNote eventId={eventId} />
      </div>
    </div>
  );
}
