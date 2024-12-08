// 사용자 메뉴 관련 요소
const userButton = document.getElementById("userButton");
const userMenu = document.getElementById("userMenu");
const userName = document.getElementById("userName");
const userEmail = document.getElementById("userEmail");

// 페이지 로드 시, 먼저 로그인 상태를 확인
document.addEventListener('DOMContentLoaded', async () => {
    const jwtToken = localStorage.getItem("jwtToken");

    // 로그인 상태라면 사용자 정보를 업데이트
    if (jwtToken) {
        console.log(localStorage);
        updateUserInfo();
    }
    //로그인 프로세스 코드(리다이렉트가 로컬로 되있어서 오류뜨는 듯)
    /*
    else if(localStorage.getItem("jwtToken") === null){
        console.log(localStorage);
        alert('로그인 정보가 없습니다. 로그인 페이지로 이동합니다.');
        window.location.href = '/';
    }
    */

    // URL에 포함된 'code' 처리 (카카오 로그인 후)
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code) {
        await handleKakaoLoginCallback(code);
    }

});

// 카카오 로그인 후 콜백 처리 함수
async function handleKakaoLoginCallback(code) {
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

async function handleLogout() {
    try {
        // 1. 로컬 스토리지 클리어
        localStorage.clear();

        // 2. 모든 쿠키 삭제
        document.cookie.split(";").forEach(function(c) {
            document.cookie = c.replace(/^ +/, "")
                .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });

        // 3. 숨겨진 iframe을 사용한 카카오 로그아웃(직접 백엔드 구현 안해도 되는 편법)
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';  // 화면에 보이지 않게 설정
        iframe.src = 'https://logins.daum.net/accounts/logout.do';
        document.body.appendChild(iframe);

        // 4. iframe 로드 완료 후 처리
        iframe.onload = () => {
            // iframe 제거
            document.body.removeChild(iframe);
            // 사용자 상태 초기화
            if (typeof setIsLoggedIn === 'function') {
                setIsLoggedIn(false);
            }
            // 로그인 페이지로 리다이렉트
            window.location.href = '/';
        };
    } catch (error) {
        console.error('로그아웃 중 에러 발생:', error);
        alert('로그아웃 처리 중 문제가 발생했습니다. 다시 시도해주세요.');
        window.location.href = '/mainpage';
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
