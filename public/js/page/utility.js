function togglePingMode() {
    isPingMode = !isPingMode;
    const button = document.getElementById("pingButton");
    button.innerText = isPingMode ? "핑 찍기 중..." : "신고지점 핑 찍기";
    button.classList.toggle("bg-gray-500");
    button.classList.toggle("bg-red-800");
}

function toggleMenu() {
    document.getElementById('menuDropdown').classList.toggle('hidden');
}

// 전역 이벤트 리스너
document.addEventListener('DOMContentLoaded', function() {
    // 여기에 추가적인 초기화 코드를 작성할 수 있습니다.
});