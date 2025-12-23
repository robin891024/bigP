import qrcodeImg from "../Css/image/qrcode-generator.png";
import { useNavigate } from "react-router-dom";

function Qrcode() {
    const navigate = useNavigate();

    return (
        <>
            <div className="checkout-page">
                <div className="checkout-container">
                    <div className="info-card">
                        {/* 標題欄位，加入返回按鈕 */}
                        <div className="card-header" style={{ alignItems: 'center' }}>
                            <h2 className="card-title">活動憑證 QR Code</h2>
                            <button
                                className="edit-button"
                                onClick={() => navigate(-1)}
                                style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                                <span className="material-symbols-outlined">arrow_back</span>
                                返回紀錄
                            </button>
                        </div>

                        {/* QR Code 顯示區域 - 居中處理 */}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '40px 0',
                            gap: '20px'
                        }}>
                            <div style={{
                                padding: '16px',
                                background: 'white',
                                borderRadius: '12px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                border: '1px solid #e2e8f0'
                            }}>
                                <img
                                    src={qrcodeImg}
                                    alt="活動 QR Code"
                                    style={{ width: '250px', height: '250px', display: 'block' }}
                                />
                            </div>
                            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                                請於活動入場時出示此 QR Code 進行核銷
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Qrcode