// src/pages/News.jsx
import React, { useState } from 'react'; 
import Header from '../components/Header'; 
import Footer from '../components/Footer'; 
import Top from '../components/ui/Top';
import AnnouncementList from '../components/AnnouncementList'; 


const DetailView = ({ announcement, onBack }) => (
  <div className="p-6 border rounded-lg shadow-lg bg-gray-50">
    <button 
      onClick={onBack} 
      className="mb-4 text-primary hover:text-accent font-semibold flex items-center"
    >
      &larr; 返回公告列表
    </button>
    <h2 className="text-3xl font-bold mb-4 text-gray-800">{announcement.title}</h2>
    <p className="text-sm text-gray-500 mb-6">發布時間: {announcement.dateOnly}</p>
    
    {/* 顯示 content 內容，使用 pre-wrap 保留換行和空格 */}
    <div className="prose max-w-none whitespace-pre-wrap text-gray-700">
      {announcement.content}
    </div>
  </div>
);


function News() {
  // 1. 新增狀態：用來儲存使用者點擊的公告物件
  // 如果為 null，表示顯示列表；如果有物件，表示顯示詳細內容
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null); 

  // 2. 處理點擊事件：接收被點擊的公告物件
  const handleSelectAnnouncement = (announcement) => {
    setSelectedAnnouncement(announcement);
  };

  // 3. 處理返回事件：將狀態設為 null，返回列表
  const handleBackToList = () => {
    setSelectedAnnouncement(null);
  };

  return (
    <>
      <Header showSearchBar={true} /> 
      <div className="max-w-4xl mx-auto p-6 bg-white min-h-screen"> 
        <main className="flex-grow">
          
          {selectedAnnouncement ? (
            // 狀態不為 null 時，顯示詳細內容
            <DetailView 
              announcement={selectedAnnouncement} 
              onBack={handleBackToList} 
            />
          ) : (
            // 狀態為 null 時，顯示列表
            <AnnouncementList 
              //將處理點擊的方法傳遞給列表元件
              onSelectAnnouncement={handleSelectAnnouncement} 
              isFullPage={true} 
            />
          )}

        </main>
      </div>
      <Top />
      <Footer />
    </>
  );
}

export default News;