// reportReceive.js
const backendUrl = '/api'; //백엔드 url

// 웹소켓 연결 및 알림 관리를 위한 클래스
class NotificationManager {
    constructor() {
        this.stompClient = null;
        this.modalElement = this.createModalElement();
        document.body.appendChild(this.modalElement);
        this.setupEventListeners();
    }

    // 모달 엘리먼트 생성
    createModalElement() {
        const modal = document.createElement('div');
        modal.innerHTML = `
            <div id="notificationModal" class="modal" style="display: none; position: fixed; top: 20px; right: 20px;
                background-color: white; padding: 20px; border-radius: 5px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                z-index: 1000; max-width: 300px;">
                <div id="notificationContent"></div>
                <button id="closeNotification" style="margin-top: 10px; padding: 5px 10px;
                    background-color: #007bff; color: white; border: none; border-radius: 3px;
                    cursor: pointer;">닫기</button>
            </div>
        `;
        return modal;
    }

    // 이벤트 리스너 설정
    setupEventListeners() {
        const closeButton = this.modalElement.querySelector('#closeNotification');
        closeButton.addEventListener('click', () => this.hideNotification());
    }

    // 알림 표시
    showNotification(message) {
        const modal = this.modalElement.querySelector('#notificationModal');
        const content = this.modalElement.querySelector('#notificationContent');

        content.textContent = message; // 메시지를 모달에 출력

        modal.style.display = 'block';

        // 5초 후 자동으로 닫기
        setTimeout(() => this.hideNotification(), 5000);
    }

    // 알림 숨기기
    hideNotification() {
        const modal = this.modalElement.querySelector('#notificationModal');
        modal.style.display = 'none';
    }

    // 웹소켓 연결 및 구독
    connect(email) {
        if (typeof Stomp === 'undefined') {
            console.error('Stomp.js가 로드되지 않았습니다.');
            return;
        }

        const socket = new SockJS(`${backendUrl}/ws`);  // WebSocket URL 수정
        this.stompClient = Stomp.over(socket);

        this.stompClient.connect({}, () => {
            const sanitizedEmail = email.replace("@", "_at_").replace(".", "_dot_");
            const destination = `/topic/${sanitizedEmail}`;
            console.log(`[구독 시작] 경로: ${destination}`);

            this.stompClient.subscribe(destination, (message) => {
                console.log(`[알림 수신] ${email}:`, message.body);
                this.showNotification(message.body); // 콘솔에서 수신한 값만 모달에 표시
            });
        });
    }

    // 연결 해제
    disconnect() {
        if (this.stompClient) {
            this.stompClient.disconnect();
            console.log('웹소켓 연결이 해제되었습니다.');
        }
    }
}

// 사용자 데이터 가져오기
function getMyUserData() {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
        const user = JSON.parse(userInfo);
        return {
            email: user.email,
            nickname: user.nickname
        };
    }
    return null;
}

// 알림 매니저 초기화 및 연결
document.addEventListener('DOMContentLoaded', () => {
    const notificationManager = new NotificationManager();
    const userData = getMyUserData();

    if (userData && userData.email) {
        notificationManager.connect(userData.email);
    } else {
        console.error('사용자 정보를 찾을 수 없습니다.');
    }

    // 페이지 언로드 시 연결 해제
    window.addEventListener('beforeunload', () => {
        notificationManager.disconnect();
    });
});
