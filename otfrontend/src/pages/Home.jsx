import React, { useState } from "react";
import Header from "../components/Header";
import Hero from "../components/Hero";
import EventSection from "../components/EventSection";
import AnnouncementList from "../components/AnnouncementList";
import Footer from "../components/Footer";
import Top from "../components/ui/Top";
import AnnoView from '../components/AnnoView';


export default function Home() {
  
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

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
