import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "../Css/CheckoutOrder.css";

function CheckoutOrder() {
    const [message, setMessage] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const location = useLocation();
    const memberId = location.state?.id;

    useEffect(() => {
        if (!memberId) return;
        fetchCheckout();
    }, [memberId]);

    const fetchCheckout = async () => {
        try {
            setLoading(true);
            const res = await fetch(`http://localhost:8080/checkoutOrders/getAll?userId=${memberId}`, {
                credentials: "include"
            });

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const data = await res.json();
            setMessage(data);
            console.log(data);
        } catch (err) {
            console.error("error:", err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusClass = (status) => {
        const statusMap = {
            "待付款": "status-pending",
            "已付款": "status-paid",
            "已完成": "status-completed",
            "已取消": "status-cancelled",
            "退款中": "status-refunding",
            "已退款": "status-refunded"
        };
        return statusMap[status] || "status-completed";
    };

    // 分頁邏輯
    const totalPages = Math.ceil(message.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = message.slice(startIndex, endIndex);

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
        <div className="checkout-page">
            <div className="checkout-container">
                {/* 使用 info-card 樣式包裹整個內容 */}
                <div className="info-card">
                    <div className="card-header">
                        <h2 className="card-title">訂單記錄</h2>
                    </div>

                    {loading ? (
                        <div className="loading-container">
                            <div>載入中...</div>
                        </div>
                    ) : message.length === 0 ? (
                        <div className="empty-state">
                            <svg className="empty-state-icon" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2"></path>
                            </svg>
                            <div>
                                <p className="empty-state-title">您還沒有任何訂單記錄</p>
                                <p className="empty-state-description">瀏覽活動並購買票券，您的訂單將會顯示在這裡！</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="table-wrapper">
                                <table className="checkout-table">
                                    <thead>
                                        <tr>
                                            <th></th>
                                            <th>活動名稱</th>
                                            <th className="table-column-ticket">票種名稱</th>
                                            <th className="table-column-price">單價</th>
                                            <th className="table-column-quantity">數量</th>
                                            <th className="table-column-date">訂購時間</th>
                                            <th className="table-column-status">狀態</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentItems.map((m, index) => (
                                            <tr key={index}>
                                                <td className="table-index">{startIndex + index + 1}</td>
                                                <td className="table-event-name">{m.eventName}</td>
                                                <td className="table-info table-column-ticket">{m.ticketTypeName}</td>
                                                <td className="table-info table-column-price">NT$ {m.unitPrice?.toLocaleString()}</td>
                                                <td className="table-info table-column-quantity">{m.quantity}</td>
                                                <td className="table-info table-column-date">{m.purchaseDate}</td>
                                                <td className="table-column-status">
                                                    <span className={`status-badge ${getStatusClass(m.orderStatus)}`}>
                                                        {m.orderStatus}
                                                    </span>
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

export default CheckoutOrder;