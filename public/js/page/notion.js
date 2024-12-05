document.addEventListener('DOMContentLoaded', () => {
    const notificationButton = document.getElementById('notificationButton');
    const notificationMenu = document.getElementById('notificationMenu');
    const notificationCount = document.getElementById('notificationCount');
    const notificationList = document.getElementById('notificationList');
    const noNotificationsMessage = document.getElementById('noNotificationsMessage');

    // 임시 알림 데이터 (백엔드에서 받아올 데이터)
    const notifications = []; // 알림이 없다고 가정 (알림이 있을 경우 이곳에 알림을 추가할 것)

    // 알림 버튼 클릭 시 알림 목록 토글
    notificationButton.addEventListener('click', () => {
        if (notificationMenu.classList.contains('hidden')) {
            notificationMenu.classList.remove('hidden');
        } else {
            notificationMenu.classList.add('hidden');
        }
    });

    // 알림 목록 업데이트 함수
    const updateNotifications = () => {
        if (notifications.length === 0) {
            notificationCount.classList.add('hidden');
            noNotificationsMessage.style.display = 'block';
            notificationList.innerHTML = `<p class="text-center text-gray-500">현재 알림이 없습니다.</p>`;
        } else {
            notificationCount.classList.remove('hidden');
            notificationCount.textContent = notifications.length;
            noNotificationsMessage.style.display = 'none';

            // 알림 목록 채우기
            notificationList.innerHTML = '';
            notifications.forEach((notification, index) => {
                const notificationItem = document.createElement('div');
                notificationItem.classList.add('p-2', 'border-b', 'border-gray-200');
                notificationItem.innerHTML = `
                    <p class="font-semibold text-gray-700">${notification.title}</p>
                    <p class="text-sm text-gray-500">${notification.message}</p>
                `;
                notificationList.appendChild(notificationItem);
            });
        }
    };

    // 페이지 로드 시 알림 상태 업데이트
    updateNotifications();

    // 백엔드에서 알림 가져오는 함수 (예시, 실제 API 연동 시 사용)
    const fetchNotifications = async () => {
        try {
            // 예시 API 호출 (알림 데이터 가져오기)
            const response = await fetch('/api/notifications'); // 실제 API 경로로 변경
            if (response.ok) {
                const data = await response.json();
                // 알림 목록을 업데이트
                notifications.length = 0; // 기존 알림 초기화
                notifications.push(...data); // 새 알림 추가
                updateNotifications();
            } else {
                console.error('알림을 가져오는 데 실패했습니다.');
            }
        } catch (error) {
            console.error('알림 API 호출 중 오류 발생:', error);
        }
    };

    // 페이지 로드 후 알림 가져오기
    fetchNotifications();
});
