import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';

function GoogleLoginButton() {
    const navigate = useNavigate();
    
    // ⚠️ 請替換成你實際的 Google Client ID
    const clientId = "494235280467-1u61vd7vgnslc7bnducg7k49s16v66mr.apps.googleusercontent.com";

    const handleSuccess = async (credentialResponse) => {
        try {
            const response = await fetch('http://localhost:8080/oauth2/google', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    credential: credentialResponse.credential
                }),
                credentials: 'include'
            });

            const data = await response.json();
            
            if (data.success) {
                navigate('/member');
            } else {
                alert('登入失敗: ' + data.message);
            }
        } catch (error) {
            alert('登入過程發生錯誤');
        }
    };

    const handleError = () => {
        alert('Google 登入失敗');
    };

    return (
        <GoogleOAuthProvider clientId={clientId}>
            <GoogleLogin
                onSuccess={handleSuccess}
                onError={handleError}
                text="signin_with"
                shape="rectangular"
                theme="outline"
                size="large"
                locale="zh_TW"
                useOneTap={false}
                use_fedcm_for_prompt={true}
            />
        </GoogleOAuthProvider>
    );
}

export default GoogleLoginButton;
