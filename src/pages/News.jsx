import React from 'react';
import Header from '../components/Header'; 
import Footer from '../components/Footer'; 
import NewsSection from '../components/NewsSection'; // 假設 NewsSection 包含列表內容


function News() {
  return (
    <div className="min-h-screen flex flex-col">

      <Header /> 
      <main className="flex-grow">
        <NewsSection isFullPage={true} /> 
      </main>
      
      <Footer /> 
    </div>
  );
}

export default News;