function optionModal() {
    fetch('../html/modal/option_modal.html')
        .then(response => response.text())
        .then(data => {
            const modalContainer = document.createElement('div');
            modalContainer.innerHTML = data;
            document.body.appendChild(modalContainer);

            // 모달 보이기
            const modalElement = document.getElementById('optionModal');
            if (modalElement) {
                modalElement.classList.remove('hidden');

                // 토글 스위치 상태 초기화
                initPushNotificationToggle();
                loadPushNotificationState(); // 상태 로드 함수 호출
            }
        })
        .catch(error => console.error('모달 로드 실패:', error));
}

// 토글 상태 변경 함수
async function togglePushNotification(enabled) {
    const jwtToken = localStorage.getItem('jwtToken'); // JWT 토큰 가져오기
    if (!jwtToken) {
        console.error("No JWT token found. Redirecting to login.");
        window.location.href = "/"; // 로그인 페이지로 리다이렉트
        return;
    }

    try {
        // 푸쉬 알림 상태 백엔드 업데이트
        const response = await fetch(`${backendUrl}/member/settings/push-notification?pushEnabled=${enabled}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwtToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`푸쉬 알림 설정 업데이트 실패: ${response.status} - ${response.statusText}`);
        }

        // 응답 본문 처리 (JSON 또는 텍스트 확인)
        const contentType = response.headers.get('Content-Type');
        let updateResponse;
        if (contentType && contentType.includes('application/json')) {
            updateResponse = await response.json(); // JSON 파싱
            console.log("푸쉬 알림 설정 업데이트 결과 (JSON):", updateResponse);
        } else {
            updateResponse = await response.text(); // 텍스트 파싱
            console.warn("푸쉬 알림 설정 업데이트 결과 (텍스트):", updateResponse);
        }

        // 업데이트 성공 시 로컬 스토리지에 저장
        localStorage.setItem('pushNotificationState', enabled ? 'true' : 'false');

        if (enabled) {
            console.log("PUSH 알림이 성공적으로 활성화되었습니다.");
        } else {
            console.log("PUSH 알림이 성공적으로 비활성화되었습니다.");
        }
    } catch (error) {
        console.error("푸쉬 알림 설정 업데이트 요청 중 오류 발생:", error);
        alert("푸쉬 알림 설정 업데이트에 실패했습니다. 다시 시도해주세요.");
    }
}

// 푸시 상태 확인
async function loadPushNotificationState() {
    const jwtToken = localStorage.getItem('jwtToken'); // JWT 토큰 가져오기
    if (!jwtToken) {
        console.error("No JWT token found. Redirecting to login.");
        window.location.href = "/"; // 로그인 페이지로 리다이렉트
        return;
    }

    try {
        const response = await fetch(`${backendUrl}/member/my`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${jwtToken}` }
        });

        if (!response.ok) {
            throw new Error(`푸쉬 알림 상태 확인 실패: ${response.status} - ${response.statusText}`);
        }

        const pushResponse = await response.json();
        console.log("푸쉬 알림 상태:", pushResponse);

        const pushEnabled = pushResponse.pushEnabled;
        // 상태를 로컬 스토리지에 저장
        localStorage.setItem('pushNotificationState', pushEnabled ? 'true' : 'false');

        // UI에 상태 반영
        const pushNotificationToggle = document.querySelector("#pushNotification");
        if (pushNotificationToggle) {
            pushNotificationToggle.checked = pushEnabled;
        }
    } catch (error) {
        console.error("푸쉬 알림 상태 확인 중 오류 발생:", error);
    }
}

// 이벤트 초기화
function initPushNotificationToggle() {
    const pushNotificationToggle = document.querySelector("#pushNotification");
    if (pushNotificationToggle) {
        pushNotificationToggle.addEventListener("change", function() {
            togglePushNotification(pushNotificationToggle.checked);
        });
    }
}

// 설정 모달 닫기
function close2Modal() {
    const modalElement = document.getElementById('optionModal');
    if (modalElement) {
        modalElement.classList.add('hidden');
    }
}