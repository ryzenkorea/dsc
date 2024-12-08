// 공통 API URL
const backendUrl = '/api'; //백엔드 url


// 보상 정보 로드
async function loadReward() {
    const jwtToken = localStorage.getItem("jwtToken");
    console.log(jwtToken);
    if (!jwtToken) {
        console.error("No JWT token found. Redirecting to login.");
        window.location.href = "/"; // 로그인 페이지로 리다이렉트
        return;
    }

    try {
        const response = await fetch(`${backendUrl}/report/my`, {
            method: "GET",
            headers: { 'Authorization': `Bearer ${jwtToken}` }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch reward data: ${response.text}`);
        }

        const reward = await response.json();

        // JSON 전체 데이터 출력
        console.log('여기에 출력2222');
        console.log(reward);

        // 보상 토큰 업데이트
        const rewardToken = document.getElementById("rewardToken");
        if (rewardToken) {
            rewardToken.textContent = `${reward.totalTokens || 0}개`;
        }

        // 신고 내역 추가
        const tableBody = document.getElementById("rewardTableBody");
        if (tableBody) {
            tableBody.innerHTML = ""; // 초기화
            if (reward.reports?.length > 0) {
                reward.reports.forEach((report) => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td class="border px-4 py-2 text-center">${report.date || "날짜 없음"}</td>
                        <td class="border px-4 py-2 text-center">${report.description || "내용 없음"}</td>
                        <td class="border px-4 py-2 text-center">${report.status || "N/A"}</td>
                    `;
                    tableBody.appendChild(row);
                });
            } else {
                tableBody.innerHTML = `<tr><td colspan="3" class="text-center text-gray-500">신고 내역이 없습니다.</td></tr>`;
            }
        }
    } catch (error) {
        console.error("Error loading reward:", error);

        const tableBody = document.getElementById("rewardTableBody");
        if (tableBody) {
            tableBody.innerHTML = `<tr><td colspan="3" class="text-center text-red-500">데이터를 불러오는 중 오류가 발생했습니다.</td></tr>`;
        }

        if (error.message.includes("401") || error.message.includes("403")) {
            localStorage.clear();
            window.location.href = "/";
        }
    }
}

// DOMContentLoaded 이벤트 리스너
document.addEventListener("DOMContentLoaded", loadReward);