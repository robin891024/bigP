import { useState } from "react"
import "../Css/Register.css"
import { Link, useNavigate } from "react-router-dom";

function Register() {
    const navigate = useNavigate()

    const [email_f, setEmail_f] = useState("");
    const [email_b, setEmail_b] = useState("");
    const [password, setPassword] = useState("");
    const [checkMessage, setCheckMessage] = useState("");
    const [cname, setCname] = useState("");
    const [alertMsg, setAlertMsg] = useState("");
    const [alertType, setAlertType] = useState("");

    const showAlert = (message, type) => {
        setAlertMsg(message);
        setAlertType(type);
        setTimeout(() => {
            setAlertMsg("");
        }, 3000)
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email_f || email_b || !password || !cname) {
            showAlert("⚠️ 請完整填寫資料", "error");
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/member/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    account : email_f + "@" + email_b,
                    password,
                    name: cname
                }),
            });

            if (!response.ok) throw new Error("伺服器回應錯誤");

            const data = await response.json();

            if (data.success) {
                showAlert("🎉 註冊成功！即將跳轉到登入頁面...", "success");
                setAccount("");
                setPassword("");
                setCname("");
                setCheckMessage("");

                setTimeout(() => {
                    navigate("/login");
                }, 2000)
            } else {
                showAlert("❌ 註冊失敗！", "error");
            }
        } catch (err) {
            showAlert("❌ 無法連線到伺服器", "error");
        }
    };

    const checkAc = async (e) => {
        e.preventDefault();

        if (!email_f.trim() || !email_b.trim()) {
            setCheckMessage("⚠️ 請輸入帳號");
            return;
        }

        try {
            const fullEmail = `${email_f}@${email_b}`
            const response = await fetch(`http://localhost:8080/member/checkAc?account=${fullEmail}`);
            if (!response.ok) throw new Error("伺服器回應錯誤");

            const isExist = await response.json();
            setCheckMessage(isExist ? "❌ 帳號已被使用" : "✅ 帳號可使用");
        } catch (err) {
            setCheckMessage("❌ 無法檢查帳號，請稍後再試");
        }
    };

    return (
        <>
            {alertMsg && (
                <div className={`alert-bar ${alertType}`}>
                    {alertMsg}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <h1>註冊</h1>
                信箱<input type="text" id="email_f" value={email_f} onBlur={checkAc} onChange={(e) => setEmail_f(e.target.value)} autoComplete="off" placeholder="輸入信箱" />
                @<input type="text" id="email_b" value={email_b} onBlur={checkAc} onChange={(e) => setEmail_b(e.target.value)} autoComplete="off" placeholder="輸入信箱" /><br />
                <div className="check-msg">{checkMessage}</div>
                密碼<input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="off" placeholder="輸入密碼" /><br />
                <br />
                姓名<input type="text" id="name" value={cname} onChange={(e) => setCname(e.target.value)} autoComplete="off" placeholder="輸入姓名" /><br />
                <input type="submit" value="註冊" />
                <hr />
                <p>已有帳號？<Link to="/login">立即登入</Link></p>
            </form>
        </>
    )

}

export default Register