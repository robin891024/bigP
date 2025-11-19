import React, { useState } from "react";
import Header from "../components/Header";
import Hero from "../components/Hero";
import EventSection from "../components/EventSection";
import AnnouncementList from "../components/AnnouncementList";
import Footer from "../components/Footer";
import Top from "../components/ui/Top";

// ⭐ 從 News.jsx 搬過來的 DetailView，不需要新增元件
const DetailView = ({ announcement, onBack }) => (
  <div className="p-6 border rounded-lg shadow-lg bg-gray-50">
    <button
      onClick={onBack}
      className="mb-4 text-primary hover:text-accent font-semibold flex items-center"
    >
      &larr; 返回公告列表
    </button>
    <h2 className="text-3xl font-bold mb-4 text-gray-800">
      {announcement.title}
    </h2>
    <p className="text-sm text-gray-500 mb-6">
      發布時間: {announcement.dateOnly}
    </p>

    <div className="prose max-w-none whitespace-pre-wrap text-gray-700">
      {announcement.content}
    </div>
  </div>
);

export default function Home() {
  // ⭐ 新增：用來控制是否正在查看完整公告
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  return (
    <div className="font-sans min-h-screen flex flex-col">
      <Header />
      <Hero />
      <EventSection />

      <div className="max-w-4xl mx-auto p-6 w-full">
        {selectedAnnouncement ? (
          // ⭐ 顯示完整內容
          <DetailView
            announcement={selectedAnnouncement}
            onBack={() => setSelectedAnnouncement(null)}
          />
        ) : (
          // ⭐ 顯示列表模式，並加上 callback
          <AnnouncementList
            limit={3}
            isFullPage={false}
            onSelectAnnouncement={setSelectedAnnouncement}
          />
        )}
      </div>

      <Top />
      <Footer />
    </div>
  );
}
