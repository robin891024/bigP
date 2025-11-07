import React from 'react';
import { news } from './ui/news';


// 1. 消息標籤組件
const NewsTag = ({ type }) => {
  const colorClass = type === 'system' ? 'bg-fuchsia-600' : 'bg-red-600';
  const text = type === 'system' ? '系統公告' : '票券配送公告';
  return (
    <span className={`${colorClass} text-white text-xs font-semibold px-1 py-0.5 rounded mr-2 align-middle`}>
      {text}
    </span>
  );
};

// 2. 消息列表主組件
const NewsSection = ({ data = news }) => {
  // 將數據分組
  const leftColumn = data.filter(item => item.isPrimary);
  const rightColumn = data.filter(item => !item.isPrimary);

  // 列表渲染函數
  const renderNewsItem = (item, isLeftColumn) => (
      <div key={item.id} className="flex py-2">
        
        {/* 內容區塊 */}
        <div className="text-sm leading-relaxed">
          {isLeftColumn && <NewsTag type={item.type} />} 

          {/* 連結文字 */}
          <a href={`/news/${item.id}`} className="text-gray-700 hover:text-blue-600">
            {item.content}
          </a>
        </div>
      </div>
  );

  return (
    <div className="max-w-6xl mx-auto py-8 px-4"> 

      <div className="flex justify-between items-center mb-6 border-b border-accent pb-2">
        <h2 className="text-2xl font-bold">最新消息</h2>
      </div>

      <div className="flex flex-col md:flex-row md:space-x-12">

        <div className="w-full md:w-1/2">
          {leftColumn.map((item, index) => (
              <div key={item.id} className="border-b border-gray-100">
                  {renderNewsItem(item, true)}
              </div>
          ))}
        </div>

        {/* 右欄：次要消息 (無底線) */}
        <div className="w-full md:w-1/2 mt-6 md:mt-0">
          {rightColumn.map(item => renderNewsItem(item, false))}
        </div>
        
      </div>
    </div>
  );
};

export default NewsSection;