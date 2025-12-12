import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";

export function useEventDetail(eventId) {
  const { isLoggedIn } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [event, setEvent] = useState(null); // 改為單一 event state
  const [loading, setLoading] = useState(true);
  const [memberId, setMemberId] = useState(null);

  // 獲取會員 ID
  useEffect(() => {
    if (isLoggedIn) {
      fetch('http://localhost:8080/member/profile', {
        credentials: 'include'
      })
        .then(res => res.json())
        .then(data => setMemberId(data.id))
        .catch(err => console.error('獲取會員資料失敗:', err));
    }
  }, [isLoggedIn]);

  // 獲取活動資料
  useEffect(() => {
    if (!eventId) return;
    
    window.scrollTo(0, 0);
    setLoading(true);
    
    // 改為只撈取單一活動
    fetch(`/api/events/detail/${eventId}`)
      .then(res => {
        if (!res.ok) throw new Error('Event not found');
        return res.json();
      })
      .then(data => {
        // 為了相容原本的結構，將單一物件放入陣列中，或者直接修改 state 結構
        // 這裡我們修改 state 結構，不再使用 events 陣列，而是單一 event
        setEvent(data);
      })
      .catch(err => {
        console.error('獲取活動失敗:', err);
        setEvent(null);
      })
      .finally(() => setLoading(false));
  }, [eventId]);

  // 檢查收藏狀態
  useEffect(() => {
    if (isLoggedIn && memberId && eventId) {
      fetch(`http://localhost:8080/wishList/get?userId=${memberId}`, {
        credentials: 'include'
      })
        .then(res => res.json())
        .then(wishList => {
          const isInWishList = wishList.some(item => String(item.eventId) === String(eventId));
          setIsFavorited(isInWishList);
        })
        .catch(err => console.error('檢查收藏狀態失敗:', err));
    }
  }, [isLoggedIn, memberId, eventId]);

  // 累加瀏覽量
  useEffect(() => {
    if (eventId) {
      fetch(`/api/events/${eventId}/daily-stats/view`, { method: 'POST' });
      fetch(`/api/events/${eventId}/stats/view`, { method: 'POST' });
    }
  }, [eventId]);

  // const event = events.find(e => String(e.id) === String(eventId)); // 不再需要從陣列尋找

  return {
    event,
    isFavorited,
    setIsFavorited,
    loading,
    memberId,
    isLoggedIn
  };
}
