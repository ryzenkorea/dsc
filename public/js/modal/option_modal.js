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

                // 토글 스위치 상태 변경 이벤트 추가
                const pushNotificationToggle = modalElement.querySelector("#pushNotification");


                // 로컬 스토리지에서 상태 로드
                if (pushNotificationToggle) {
                    const pushNotificationState = localStorage.getItem('pushNotificationState');
                    pushNotificationToggle.checked = pushNotificationState === 'true'; // 저장된 값이 'true'면 체크됨
                    pushNotificationToggle.addEventListener("change", function() {
                        togglePushNotification(pushNotificationToggle.checked);
                    });
                }


            }
        })
        .catch(error => console.error('모달 로드 실패:', error));
}

// 토글 상태 변경 함수 (확장성을 고려하여)
function togglePushNotification(enabled) {
    if (enabled) {
        console.log("PUSH 알림이 켜졌습니다.");
        // 나중에 기능 추가: PUSH 알림 활성화 관련 작업
        localStorage.setItem('pushNotificationState', 'true'); // 상태 저장
    } else {
        console.log("PUSH 알림이 꺼졌습니다.");
        // 나중에 기능 추가: PUSH 알림 비활성화 관련 작업
        localStorage.setItem('pushNotificationState', 'false'); // 상태 저장
    }
}

// 설정 모달 닫기
function close2Modal() {
    document.getElementById('optionModal').classList.add('hidden');
}
