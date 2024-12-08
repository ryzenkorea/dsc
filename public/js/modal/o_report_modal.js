const BASE_URL = '/report';  // 벡엔드 서버 API URL

// 좌표를 가져오는 함수 추가
function getCurrentCoordinates() {
    return {
        latitude: localStorage.getItem("latitude"),
        longitude: localStorage.getItem("longitude")
    };
}
//토큰 가져오는 함수
function getToken() {
    const token = localStorage.getItem("jwtToken");
    return token;
}

//기타 신고 모달
function loadModal() {
    fetch('../html/modal/other_report_modal.html')
        .then(response => response.text())
        .then(data => {
            const modalContainer = document.createElement('div');
            modalContainer.innerHTML = data;
            document.body.appendChild(modalContainer);

            // 모달 보이기
            document.getElementById('alertModal').classList.remove('hidden');
        })
        .catch(error => console.error('모달 로드 실패:', error));
}

function openModal() {
    document.getElementById('alertModal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('alertModal').classList.add('hidden');
}

//신고 전송
async function sendReport(token, type, latitude, longitude) {
    try {
        const response = await fetch(`${BASE_URL}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                type: type,
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
                timestamp: new Date().toISOString(),
                text: null
            })
        });

        if (response.ok) {
            const result = await response.json();
            console.log("신고 전송 성공:", result);
            console.log(`토큰:${token}, 타입:${type}, 신고 전송 좌표: 위도(${latitude}), 경도(${longitude}), 시간: ${new Date().toISOString()}`);
        } else {
            const error = await response.text(); // 에러 메시지를 텍스트로 읽기
            console.error("신고 전송 실패:", error);
            console.log(`Bearer ${token}, 타입:${type}, 신고 전송 좌표: 위도(${latitude}), 경도(${longitude}), 시간: ${new Date().toISOString()}`);
        }
    } catch (err) {
        console.error("신고 전송 중 오류 발생:", err);
    }
}


// 트럭 신고
function reportAlert_truck() {
    const coords = getCurrentCoordinates();
    const token = getToken(); // 토큰 가져오기
    const confirmation = confirm(`위도(${coords.latitude}), 경도(${coords.longitude})에서 트럭 사고가 발생. 신고하시겠습니까?`);
    if (confirmation) {
        alert("신고가 접수되었습니다!");
        sendReport(token, "truck", coords.latitude, coords.longitude);
    }
}

// 도로 신고
function reportAlert_road() {
    const coords = getCurrentCoordinates();
    const token = getToken(); // 토큰 가져오기
    const confirmation = confirm(`위도(${coords.latitude}), 경도(${coords.longitude})에서 도로 막힘이 발생. 신고하시겠습니까?`);
    if (confirmation) {
        alert("신고가 접수되었습니다!");
        sendReport(token, "road", coords.latitude, coords.longitude);
    }
}

// 자동차 신고
function reportAlert_car() {
    const coords = getCurrentCoordinates();
    const token = getToken(); // 토큰 가져오기
    const confirmation = confirm(`위도(${coords.latitude}), 경도(${coords.longitude})에서 자동차 사고가 발생. 신고하시겠습니까?`);
    if (confirmation) {
        alert("신고가 접수되었습니다!");
        sendReport(token, "car", coords.latitude, coords.longitude);
    }
}

// 음주 신고
function reportAlert_alcohol() {
    const coords = getCurrentCoordinates();
    const token = getToken(); // 토큰 가져오기
    const confirmation = confirm(`위도(${coords.latitude}), 경도(${coords.longitude})에서 음주 운전 발생. 신고하시겠습니까?`);
    if (confirmation) {
        alert("신고가 접수되었습니다!");
        sendReport(token, "alcohol", coords.latitude, coords.longitude);
    }
}

// 기타 신고
function reportAlert_other() {
    const coords = getCurrentCoordinates();
    const token = getToken(); // 토큰 가져오기
    const confirmation = confirm(`위도(${coords.latitude}), 경도(${coords.longitude})에서 기타 사고 발생. 신고하시겠습니까?`);
    if (confirmation) {
        alert("신고가 접수되었습니다!");
        sendReport(token, "other", coords.latitude, coords.longitude, text);
    }
    closeModal();
}


// 신고 모달 관련 이벤트 리스너
document.addEventListener('DOMContentLoaded', function() {
    const otherOption = document.getElementById('otherOption');
    const detailsSection = document.getElementById('detailsSection');

});