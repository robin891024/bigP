import React from 'react';
import { FaPaperclip, FaChevronDown } from 'react-icons/fa';
import Header from '../components/Header'; 
import Footer from '../components/Footer'; 
import Top from '../components/ui/Top';

const InputGroup = ({ label, children, required = false, infoText }) => {
  return (
    <div className="mb-6">
      <label className="block text-sm font-semibold text-gray-800 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {infoText && (
        <p className="mt-1 text-xs text-gray-500">{infoText}</p>
      )}
    </div>
  );
};

const FormPage = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('表單已提交');
    // 在這裡處理表單提交邏輯
  };


  return (
    <>
    <Header showSearchBar={true} /> 
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 border-b-4 border-primary pb-2 inline-block">聯絡我們</h1>
      <form onSubmit={handleSubmit}>
        
        {/* 姓名 */}
        <InputGroup label="姓名" required>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </InputGroup>

        <InputGroup label="活動名稱" required>
          <input
            type="text"
            placeholder="若無特定活動，請填寫無"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </InputGroup>

        {/* 訂單日期 */}
        <InputGroup label="訂單日期">
          <input
            type="date"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <p className="mt-1 text-sm text-gray-500">
            若無特定活動，請選擇本月最後一天的日期。
          </p>
        </InputGroup>

        {/* 訂單編號 */}
        <InputGroup label="訂單編號">
          <input
            type="text"
            placeholder="訂單編號可於【訂單查詢】中查看，若無訂單，請填寫無。"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </InputGroup>

        {/* 訂單會員姓名 */}
        <InputGroup label="電子郵件地址">
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        
        </InputGroup>

        {/* 標題 */}
        <InputGroup label="標題" required>
          <input
            type="text"
            placeholder="範例：如何購買演唱會門票？"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </InputGroup>

        {/* 描述 - 直接內嵌純文字區域 */}
        <InputGroup label="描述" required>
          
          <div className="border border-gray-300 rounded-md">
            <textarea
              rows="10"
              placeholder="範例：如何購買演唱會門票？" 
              className="w-full p-4 resize-none focus:outline-none text-sm"
            ></textarea>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            請輸入您的請求詳情。我們的客服人員會儘快回應。
          </p>
        </InputGroup>

        {/* 提交按鈕 */}
        <div className="mt-8">
          <button
            type="submit"
            className="w-full bg-primary text-white py-3 rounded-md text-lg font-semibold hover:bg-blue-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            提交
          </button>
        </div>

      </form>
    </div>
    <Top />
    <Footer />
    </>
  );
};

export default FormPage;