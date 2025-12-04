import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "../Css/CollectPage.css";

function CollectPage() {
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const location = useLocation();
    const memberId = location.state?.id;

    useEffect(() => {
        if (!memberId) return;
        fetchWishList();
    }, [memberId]);

    const fetchWishList = async () => {
        try {
            setLoading(true);
            const res = await fetch(`http://localhost:8080/wishList/get?userId=${memberId}`, {
                credentials: "include"
            });
            
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            
            const data = await res.json();
            setList(data);
        } catch (err) {
            console.error("error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (eventId) => {
        if (!window.confirm('確定要刪除這個收藏嗎？')) {
            return;
        }

        try {
            const res = await fetch('http://localhost:8080/wishList/delete', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    memberId: memberId,
                    eventId: eventId
                })
            });

            const data = await res.json();

            if (data.success) {
                // 刪除成功，重新載入列表
                await fetchWishList();
                // 如果當前頁沒有資料了，回到上一頁
                if (currentItems.length === 1 && currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                }
            } else {
                alert(data.message || '刪除失敗');
            }
        } catch (err) {
            console.error('刪除錯誤:', err);
            alert('刪除失敗，請稍後再試');
        }
    };

    const getStatusClass = (status) => {
        const statusMap = {
            "未開放": "status-completed",
            "活動進行中": "status-ongoing",
            "已結束": "status-completed",
            "開放購票": "status-upcoming",
            "已取消": "status-cancelled"
        };
        return statusMap[status] || "status-completed";
    };

    // 分頁邏輯
    const totalPages = Math.ceil(list.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = list.slice(startIndex, endIndex);

    const goToPage = (page) => {
        setCurrentPage(page);
    };

    const goToPrevious = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const goToNext = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    return (
        <div className="collect-page">
            <div className="collect-container">
                {/* 使用 info-card 樣式包裹整個內容 */}
                <div className="info-card">
                    <div className="card-header">
                        <h2 className="card-title">收藏活動</h2>
                    </div>

                    {loading ? (
                        <div className="loading-container">
                            <div>載入中...</div>
                        </div>
                    ) : list.length === 0 ? (
                        <div className="empty-state">
                            <svg className="empty-state-icon" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"></path>
                            </svg>
                            <div>
                                <p className="empty-state-title">您還沒有收藏任何活動</p>
                                <p className="empty-state-description">瀏覽活動並將它們加入您的收藏清單！</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="table-wrapper">
                                <table className="collect-table">
                                    <thead>
                                        <tr>
                                            <th></th>
                                            <th>活動名稱</th>
                                            <th className="table-column-organizer">發起者</th>
                                            <th className="table-column-phone">電話</th>
                                            <th className="table-column-status">活動狀態</th>
                                            <th>活動連結</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentItems.map((w, i) => (
                                            <tr key={i}>
                                                <td className="table-index">{startIndex + i + 1}</td>
                                                <td className="table-event-name">{w.eventName}</td>
                                                <td className="table-info table-column-organizer">{w.organizerName}</td>
                                                <td className="table-info table-column-phone">{w.organizerTel}</td>
                                                <td className="table-column-status">
                                                    <span className={`status-badge ${getStatusClass(w.status)}`}>
                                                        {w.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <a className="event-link" href={`/event/${w.eventId}`}>查看活動</a>
                                                </td>
                                                <td>
                                                    <button 
                                                        className="delete-button"
                                                        onClick={() => handleDelete(w.eventId)}
                                                        title="刪除收藏"
                                                    >
                                                        <span className="material-symbols-outlined">delete</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* 分頁控制 */}
                            {totalPages > 1 && (
                                <div className="pagination">
                                    <button 
                                        className="pagination-button" 
                                        onClick={goToPrevious}
                                        disabled={currentPage === 1}
                                    >
                                        上一頁
                                    </button>
                                    
                                    {[...Array(totalPages)].map((_, index) => {
                                        const page = index + 1;
                                        // 只顯示當前頁面附近的頁碼
                                        if (
                                            page === 1 || 
                                            page === totalPages || 
                                            (page >= currentPage - 1 && page <= currentPage + 1)
                                        ) {
                                            return (
                                                <button
                                                    key={page}
                                                    className={`pagination-button ${currentPage === page ? 'active' : ''}`}
                                                    onClick={() => goToPage(page)}
                                                >
                                                    {page}
                                                </button>
                                            );
                                        } else if (
                                            page === currentPage - 2 || 
                                            page === currentPage + 2
                                        ) {
                                            return <span key={page} className="pagination-info">...</span>;
                                        }
                                        return null;
                                    })}
                                    
                                    <button 
                                        className="pagination-button" 
                                        onClick={goToNext}
                                        disabled={currentPage === totalPages}
                                    >
                                        下一頁
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default CollectPage;