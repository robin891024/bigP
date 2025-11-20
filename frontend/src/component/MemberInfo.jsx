import { useEffect, useState } from "react"

function MemberInfo() {

    const [message, setMessage] = useState("Loading...")

    useEffect(() => {
        fetch("http://localhost:8080/member/findAll", {
            credentials: 'include'
        })
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.text();
            })
            .then(text => setMessage(text))
            .catch(() => {
                setMessage('無法載入會員資料');
            });
    }, [])

    return (
        <>
            <div className="member-info">
                <h2>會員資料</h2>

                <div className="info-row">
                    <span>帳號</span>
                    <button>修改</button>
                </div>

                <div className="info-row">
                    <span>密碼</span>
                    <button>修改</button>
                </div>

                <div className="info-row">
                    <span>信箱</span>
                    <button>修改</button>
                </div>

                <div className="fetch-message">{message}</div>
            </div>
        </>
    )



}
export default MemberInfo