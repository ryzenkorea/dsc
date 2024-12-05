const backendUrl = "/api";

document.getElementById("kakao-login-btn").addEventListener("click", async () => {
    try {
        const response = await fetch(`${backendUrl}/kakao/login-url`, {
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) throw new Error("Failed to fetch login URL");

        const loginUrl = await response.text();
        sessionStorage.setItem('isKakaoLogin', 'true');
        window.location.href = loginUrl;
    } catch (error) {
        console.error("Login error:", error);
        document.getElementById("status").innerText = "Error: " + error.message;
    }
});

window.onload = async () => {
    const code = new URLSearchParams(window.location.search).get("code");
    const isKakaoLogin = sessionStorage.getItem('isKakaoLogin');

    if (code && isKakaoLogin) {
        try {
            const response = await fetch(`${backendUrl}/kakao/callback?code=${code}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Login response:', data); // 디버깅용 로그

            if (!data.jwtToken) {
                throw new Error('No JWT token in response');
            }

            // JWT 토큰 저장
            localStorage.setItem("jwtToken", data.jwtToken);

            // 사용자 정보 객체 생성 및 저장
            const userInfo = {
                email: data.email || 'Unknown',
                nickname: data.nickname || 'User',
                profileImage: data.profileImage || null
            };

            // 로컬 스토리지에 사용자 정보 저장
            localStorage.setItem("userInfo", JSON.stringify(userInfo));

            // 저장 확인 로그
            console.log('Saved JWT:', localStorage.getItem("jwtToken"));
            console.log('Saved user info:', localStorage.getItem("userInfo"));

            // 로그인 상태 정리
            sessionStorage.removeItem('isKakaoLogin');

            // 메인 페이지로 리다이렉트
            window.location.href = "/mainpage";
        } catch (error) {
            console.error("Login process error:", error);
            alert("로그인 처리 중 오류가 발생했습니다.");
            window.location.href = "/";
        }
    }
};