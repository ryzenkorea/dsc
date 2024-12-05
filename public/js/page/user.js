// 사용자 메뉴 관련 요소
const userButton = document.getElementById("userButton");
const userMenu = document.getElementById("userMenu");
const userName = document.getElementById("userName");
const userEmail = document.getElementById("userEmail");

// 페이지 로드시 사용자 정보 업데이트
document.addEventListener('DOMContentLoaded', async () => {
    updateUserInfo();

    // 디버깅용: 저장된 정보 확인
    console.log("JWT Token:", localStorage.getItem("jwtToken"));
    console.log("User Info:", localStorage.getItem("userInfo"));

    // URL에 포함된 'code' 처리
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code) {
        try {
            const response = await fetch(`/api/kakao/callback?code=${code}`, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });

            if (!response.ok) {
                throw new Error(`Error fetching user info: ${response.status}`);
            }

            const data = await response.json();

            if (!data.jwtToken) {
                throw new Error('JWT Token is missing in response.');
            }

            // 로컬 스토리지에 저장
            localStorage.setItem("jwtToken", data.jwtToken);
            localStorage.setItem("userInfo", JSON.stringify({
                email: data.email || 'Unknown',
                nickname: data.nickname || 'User',
                profileImage: data.profileImage || ''
            }));

            // URL 정리 (쿼리 파라미터 제거)
            window.history.replaceState({}, document.title, "/mainpage");

            // 사용자 정보를 화면에 업데이트
            updateUserInfo();

        } catch (error) {
            console.error("Error handling code in mainpage:", error);
            alert("사용자 정보를 가져오는 데 문제가 발생했습니다.");
            window.location.href = "/";
        }
    }
});

// 카카오 로그인 후 사용자 정보 표시
function updateUserInfo() {
    try {
        const userInfo = localStorage.getItem("userInfo");
        if (userInfo) {
            const parsedInfo = JSON.parse(userInfo);

            // 사용자 정보 업데이트
            userName.textContent = parsedInfo.nickname || "사용자";
            userEmail.textContent = parsedInfo.email || "";

            // 프로필 이미지가 있다면 표시
            if (parsedInfo.profileImage) {
                userButton.innerHTML = `
                    <img src="${parsedInfo.profileImage}" alt="profile"
                         class="h-6 w-6 rounded-full">`;
            }
        }
    } catch (error) {
        console.error("Error updating user info:", error);
    }
}

// 로그아웃 처리 함수
async function handleLogout() {
    try {
        // 카카오 로그아웃
        if (window.Kakao && Kakao.Auth.getAccessToken()) {
            await new Promise((resolve) => {
                Kakao.Auth.logout(() => {
                    console.log('Kakao logout completed');
                    resolve();
                });
            });
        }

        // 백엔드 로그아웃 호출 (선택적)
        const jwtToken = localStorage.getItem('jwtToken');
        if (jwtToken) {
            try {
                await fetch('/api/member/logout', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${jwtToken}`
                    }
                });
            } catch (error) {
                console.error('Backend logout error:', error);
            }
        }

        // 로컬 스토리지 클리어
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('userInfo');
        sessionStorage.clear();

        // 쿠키 삭제 (필요한 경우)
        document.cookie.split(";").forEach(function(c) {
            document.cookie = c.replace(/^ +/, "")
                .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });

        // 로그인 페이지로 리다이렉트
        window.location.href = '/';

    } catch (error) {
        console.error('Logout error:', error);
        // 에러가 발생하더라도 로그인 페이지로 리다이렉트
        window.location.href = '/';
    }
}

// 로그아웃 버튼에 이벤트 리스너 추가
document.getElementById('logoutBtn').addEventListener('click', handleLogout);

// 메뉴 토글 기능
userButton.addEventListener("click", () => {
    userMenu.classList.toggle("hidden");
});

// 외부 클릭시 메뉴 닫기
document.addEventListener("click", (event) => {
    if (!userButton.contains(event.target) && !userMenu.contains(event.target)) {
        userMenu.classList.add("hidden");
    }
});
