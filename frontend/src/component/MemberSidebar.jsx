import { useNavigate } from "react-router-dom";

function MemberSidebar() {

    const navigate = useNavigate()

    const handleLogout = async () => {
        try {
            const res = await fetch("http://localhost:8080/member/logout", {
                method: "POST",
                credentials: "include"
            })

            // 如果是 403 (token 過期)，直接跳轉到登入頁面並顯示過期訊息
            if (res.status === 403) {
                navigate("/login", { state: { expired: true } });
                return;
            }

            const success = await res.json();

            if (success) {
                navigate("/login");
            }
        } catch (error) {
            // 發生錯誤時也跳轉到登入頁面
            navigate("/login");
        }
    }


    return (
        <div className="member-sidebar">
            <div className="sidebar-item active">會員資訊</div>
            <div className="sidebar-item">收藏</div>
            <div className="sidebar-item">購買紀錄</div>
            <div className="sidebar-item" onClick={handleLogout}>登出</div>
        </div>
    )

}

export default MemberSidebar