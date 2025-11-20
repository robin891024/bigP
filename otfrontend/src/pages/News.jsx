// src/pages/News.jsx
import React, { useState } from 'react'; 
import Header from '../components/Header'; 
import Footer from '../components/Footer'; 
import Top from '../components/ui/Top';
import AnnouncementList from '../components/AnnouncementList'; 
import AnnoView from '../components/AnnoView';


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
      <div className="max-w-4xl mx-auto p-6 bg-white min-h-screen font-sans"> 
        <main className="flex-grow">
          
          {selectedAnnouncement ? (
            // 狀態不為 null 時，顯示詳細內容
            <AnnoView 
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