import React from 'react';

// 導入返回圖標 (假設您在專案中使用 lucide-react 或類似的圖標庫)
import { ArrowLeft } from 'lucide-react'; 

const DetailView = ({ announcement, onBack }) => (
  <div className="p-6 border rounded-lg shadow-lg bg-gray-50">
    <button 
      onClick={onBack} 
      className="mb-4 text-primary hover:text-accent font-semibold flex items-center transition duration-150"
    >
      {/* 使用 ArrowLeft 圖標讓視覺更美觀 */}
      <ArrowLeft size={20} className="mr-2" />
      返回
    </button>
    
    <h2 className="text-3xl font-bold mb-4 text-gray-800">{announcement.title}</h2>
    
    {/* 由於 dateOnly 屬性可能不存在，建議使用一個簡單的檢查或預設值 */}
    <p className="text-sm text-gray-500 mb-6">
      發布時間: {announcement.dateOnly || '日期未知'}
    </p>
    
    {/* 顯示 content 內容，使用 pre-wrap 保留換行和空格 */}
    <div className="prose max-w-none whitespace-pre-wrap text-gray-700">
      {announcement.content}
    </div>
  </div>
);

export default DetailView;