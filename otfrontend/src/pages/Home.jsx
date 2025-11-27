import React, { useState } from "react";
import Header from "../components/Header";
import Hero from "../components/Hero";
import EventSection from "../components/EventSection";
import AnnouncementList from "../components/AnnouncementList";
import Footer from "../components/Footer";
import Top from "../components/ui/Top";
import AnnoView from '../components/AnnoView';
import useSessionTracker from "../hooks/useSessionTracker";


export default function Home() {
  
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  // 這將在 Home 元件 mount 時自動執行 Session 邏輯和後端呼叫
  useSessionTracker('homepage');
  return (
    <div className="font-sans min-h-screen flex flex-col">
      <Header />
      <Hero />
      <EventSection />

      <div className="max-w-4xl mx-auto p-6 w-full">
        {selectedAnnouncement ? (
          
          <AnnoView
            announcement={selectedAnnouncement}
            onBack={() => setSelectedAnnouncement(null)}
          />
        ) : (
          
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
