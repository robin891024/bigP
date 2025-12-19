
import React, { useEffect, useState } from "react";

export default function EventIntro({ eventId }) {
  const [intro, setIntro] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!eventId) return;
    setLoading(true);
    setError(null);
    fetch(`/api/events/intro/${eventId}`)
      .then(res => {
        if (!res.ok) throw new Error("活動介紹取得失敗");
        return res.text();
      })
      .then(data => {
        setIntro(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [eventId]);

  if (loading) return <div className="text-center py-8">活動介紹載入中...</div>;
  if (error) return <div className="text-center text-red-600 py-8">{error}</div>;

  // 判斷內容是否包含 HTML 標籤
  const hasHtml = /<[a-z][\s\S]*>/i.test(intro);
  // 如果是純文字，則將換行符號轉為 <br>；如果是 HTML 則保持原樣
  const processedIntro = hasHtml ? intro : intro.replace(/\n/g, '<br>');

  return (
    <div className="pt-4">
      <div 
        className="rich-text"
        dangerouslySetInnerHTML={{ __html: processedIntro }} 
      />
    </div>
  );
}
