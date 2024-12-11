// reportReceive.js
const backendUrl = '/api'; //백엔드 url

// 웹소켓 연결 및 알림 관리를 위한 클래스
class NotificationManager {
    constructor() {
        this.stompClient = null;
        this.currentReportData = null; // 현재 표시 중인 신고 데이터 저장
        this.modalElement = this.createModalElement();
        document.body.appendChild(this.modalElement);
        this.setupEventListeners();
    }

    createModalElement() {
        const modal = document.createElement('div');
        modal.innerHTML = `
            <div id="notificationModal" class="modal" style="display: none; position: fixed; top: 20px; right: 20px;
                background-color: white; padding: 20px; border-radius: 5px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                z-index: 1000; max-width: 300px;">
                <div id="notificationContent" style="font-size: 16px; color: #000; margin-bottom: 15px;"></div>
                <div id="notificationNote" style="margin-top: 10px; font-size: 12px; color: #d9534f;">
                    본 알림은 반경 3km 이내의 신고 내역만 표시됩니다.
                </div>
                <div style="display: flex; gap: 10px; margin-top: 15px;">
                    <button id="voteYes" style="flex: 1; padding: 8px; background-color: #28a745; color: white;
                        border: none; border-radius: 3px; cursor: pointer;">신뢰</button>
                    <button id="voteNo" style="flex: 1; padding: 8px; background-color: #dc3545; color: white;
                        border: none; border-radius: 3px; cursor: pointer;">불신</button>
                    <button id="closeNotification" style="flex: 1; padding: 8px; background-color: #6c757d;
                        color: white; border: none; border-radius: 3px; cursor: pointer;">닫기</button>
                </div>
            </div>
        `;
        return modal;
    }

    setupEventListeners() {
        const closeButton = this.modalElement.querySelector('#closeNotification');
        const voteYesButton = this.modalElement.querySelector('#voteYes');
        const voteNoButton = this.modalElement.querySelector('#voteNo');

        closeButton.addEventListener('click', () => this.hideNotification());
        voteYesButton.addEventListener('click', () => this.handleVote(true));
        voteNoButton.addEventListener('click', () => this.handleVote(false));
    }

    async handleVote(vote) {
        if (!this.currentReportData) {
            console.error('신고 데이터가 없습니다.');
            return;
        }

        const token = localStorage.getItem('jwtToken');
        if (!token) {
            console.error('인증 토큰이 없습니다.');
            return;
        }

        try {
            const response = await fetch(`${backendUrl}/report/vote`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    senderEmail: this.currentReportData.senderEmail,
                    reportId: this.currentReportData.reportId,
                    vote: vote
                })
            });

            if (response.ok) {
                alert(vote ? '신뢰 투표가 완료되었습니다.' : '불신 투표가 완료되었습니다.');
                this.hideNotification();
            } else {
                const errorData = await response.json();
                if (response.status === 400 && errorData.error === "Duplicate or invalid vote.") {
                    alert('이미 투표하셨거나 유효하지 않은 투표입니다.');
                } else {
                    alert('투표 처리 중 오류가 발생했습니다.');
                }
            }
        } catch (error) {
            console.error('투표 처리 중 오류:', error);
            alert('투표 처리 중 오류가 발생했습니다.');
        }
    }

    showNotification(message, reportData) {
        const modal = this.modalElement.querySelector('#notificationModal');
        const content = this.modalElement.querySelector('#notificationContent');

        this.currentReportData = reportData; // 신고 데이터 저장
        content.textContent = message;
        modal.style.display = 'block';

        setTimeout(() => this.hideNotification(), 10000);
    }

    hideNotification() {
        const modal = this.modalElement.querySelector('#notificationModal');
        modal.style.display = 'none';
        this.currentReportData = null; // 데이터 초기화
    }

    connect(email) {
        if (typeof Stomp === 'undefined') {
            console.error('Stomp.js가 로드되지 않았습니다.');
            return;
        }

        const socket = new SockJS(`${backendUrl}/ws`);
        this.stompClient = Stomp.over(socket);

        this.stompClient.connect({}, () => {
            const sanitizedEmail = email.replace("@", "_at_").replace(".", "_dot_");
            const destination = `/topic/${sanitizedEmail}`;
            console.log(`[구독 시작] 경로: ${destination}`);

            this.stompClient.subscribe(destination, (message) => {
                console.log(`[알림 수신] ${email}:`, message.body);

                try {
                    const data = JSON.parse(message.body);
                    if (data && data.message) {
                        // 메시지와 함께 신고 데이터도 전달
                        this.showNotification(data.message, {
                            senderEmail: data.senderEmail,
                            reportId: data.reportId
                        });
                    } else {
                        console.error("수신된 메시지에 필요한 데이터가 없습니다:", data);
                    }
                } catch (error) {
                    console.error("메시지 파싱 오류:", error);
                }
            });
        });
    }

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
