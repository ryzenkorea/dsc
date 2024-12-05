// auth-check.js
function checkAuthStatus() {
    const jwtToken = localStorage.getItem('jwtToken');
    const userInfo = localStorage.getItem('userInfo');

    // 토큰이나 사용자 정보가 없으면 로그인 페이지로 리다이렉트
    if (!jwtToken || !userInfo) {
        window.location.href = '/';
        return false;
    }

    try {
        // JWT 토큰 만료 체크 (선택적)
        const tokenData = JSON.parse(atob(jwtToken.split('.')[1]));
        if (tokenData.exp * 1000 < Date.now()) {
            // 토큰이 만료되었으면 로그아웃 처리
            localStorage.removeItem('jwtToken');
            localStorage.removeItem('userInfo');
            window.location.href = '/';
            return false;
        }
    } catch (error) {
        console.error('Token validation error:', error);
        window.location.href = '/';
        return false;
    }

    return true;
}

// 페이지 로드 시 인증 상태 체크
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
});

// 주기적으로 인증 상태 체크 (선택적)
setInterval(checkAuthStatus, 60000); // 1분마다 체크