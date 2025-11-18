import React from 'react';
import Header from '../components/Header'; 
import Footer from '../components/Footer'; 
import NewsSection from '../components/NewsSection'; 
import Top from '../components/ui/Top';

function News() {
  return (
    <>
      <Header showSearchBar={true} /> 
      <div className="max-w-4xl mx-auto p-6 bg-white min-h-screen"> 
        <main className="flex-grow">
          {/* 傳遞 isFullPage=true 參數 */}
          <NewsSection isFullPage={true} /> 
        </main>
      </div>
      <Top />
      <Footer />
    </>
  );
}

export default News;