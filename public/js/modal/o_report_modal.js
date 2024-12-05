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

//신고버튼 눌렸을때(백엔드,DB에 따라 수정필요)
function reportAlert_truck() {
    // 위치 기반 알림 창 표시
    const confirmation = confirm("현재 지정된 위치로 신고가 진행됩니다. 신고하시겠습니까?");

    if (confirmation) {
        // 확인 버튼 클릭 시 신고 접수
        alert("신고가 접수되었습니다!");
        closeModal();  // 모달 닫기
    } else {
        // 취소 버튼 클릭 시 아무 일도 하지 않음
        console.log("신고 취소됨.");
    }
}
function reportAlert_road() {
    // 위치 기반 알림 창 표시
    const confirmation = confirm("현재 지정된 위치로 신고가 진행됩니다. 신고하시겠습니까?");

    if (confirmation) {
        // 확인 버튼 클릭 시 신고 접수
        alert("신고가 접수되었습니다!");
        closeModal();  // 모달 닫기
    } else {
        // 취소 버튼 클릭 시 아무 일도 하지 않음
        console.log("신고 취소됨.");
    }
}
function reportAlert_car() {
    // 위치 기반 알림 창 표시
    const confirmation = confirm("현재 지정된 위치로 신고가 진행됩니다. 신고하시겠습니까?");

    if (confirmation) {
        // 확인 버튼 클릭 시 신고 접수
        alert("신고가 접수되었습니다!");
        closeModal();  // 모달 닫기
    } else {
        // 취소 버튼 클릭 시 아무 일도 하지 않음
        console.log("신고 취소됨.");
    }
}
function reportAlert_alcohol() {
    // 위치 기반 알림 창 표시
    const confirmation = confirm("현재 지정된 위치로 신고가 진행됩니다. 신고하시겠습니까?");

    if (confirmation) {
        // 확인 버튼 클릭 시 신고 접수
        alert("신고가 접수되었습니다!");
        closeModal();  // 모달 닫기
    } else {
        // 취소 버튼 클릭 시 아무 일도 하지 않음
        console.log("신고 취소됨.");
    }
}
function reportAlert_other() {
    alert("신고가 접수되었습니다!");
    closeModal();
}

// 신고 모달 관련 이벤트 리스너
document.addEventListener('DOMContentLoaded', function() {
    const otherOption = document.getElementById('otherOption');
    const detailsSection = document.getElementById('detailsSection');

});