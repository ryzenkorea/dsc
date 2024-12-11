// DOMContentLoaded 이벤트 리스너
document.addEventListener("DOMContentLoaded", isToken);
document.addEventListener("DOMContentLoaded", loadToken);
document.addEventListener("DOMContentLoaded", loadReward);
document.addEventListener("DOMContentLoaded", loadRecord);

const backendUrl = '/api'; //백엔드 url
const jwtToken = localStorage.getItem("jwtToken");

async function isToken() {
    if (!jwtToken) {
        console.error("No JWT token found. Redirecting to login.");
        window.location.href = "/"; // 로그인 페이지로 리다이렉트
        return;
    }
}

// 토큰 정보 로드
async function loadToken() {
    try {
        const response = await fetch(`${backendUrl}/member/get-blockToken`, {
            method: "GET",
            headers: { 'Authorization': `Bearer ${jwtToken}` }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch token data: ${response.text}`);
        }


        const tokenResponse = await response.json();

        let amount = tokenResponse.balance;
        let onlyNumber = amount.replace(" ETH", ""); // 숫자만 남김

        // 보상 토큰 업데이트
        const rewardToken = document.getElementById("rewardToken");
        if (rewardToken) {
            rewardToken.textContent = `${onlyNumber || 0}개`;
        }
    } catch (error) {
        console.error("Error loading token:", error);

        const rewardToken = document.getElementById("rewardToken");
        if (rewardToken) {
            rewardToken.textContent = `token 데이터를 불러오는 중 오류가 발생했습니다.`;
        }
    }
}

// 보상 정보 로드
async function loadReward() {
    try {
        const response = await fetch(`${backendUrl}/report/my`, {
            method: "GET",
            headers: { 'Authorization': `Bearer ${jwtToken}` }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch reward data: ${response.text}`);
        }

        const reward = await response.json();

        // reward JSON 전체 데이터 출력
        console.log('reward json 전체 데이터 출력');
        console.log(reward);

        // 신고 내역 추가
        const tableBody = document.getElementById("rewardTableBody");
        if (tableBody) {
            tableBody.innerHTML = ""; // 초기화
            // json을 배열로 변경
            const reports = Array.isArray(reward) ? reward : reward.reports;
            console.log('reward 배열 정보 출력');
            console.log(reports);

            if (reports?.length > 0) {
                // 배열을 역순으로 정렬
                const reversedReports = [...reports].reverse();

                reversedReports.forEach((report) => {
                    const formattedDate = formatDate(report.timestamp);
                    const row = document.createElement("tr");
                    // p/f부분 아직 정보 없어서 임시로 id값 넣어둠
                    row.innerHTML = `
                        <td class="border px-4 py-2 text-center">${formattedDate || "날짜 없음"}</td>
                        <td class="border px-4 py-2 text-center">${report.message || "내용 없음"}</td>
                        <td class="border px-4 py-2 text-center">${report.id || "N/A"}</td>
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
            tableBody.innerHTML = `<tr><td colspan="3" class="text-center text-red-500">reward 데이터를 불러오는 중 오류가 발생했습니다.</td></tr>`;
        }

        if (error.message.includes("401") || error.message.includes("403")) {
            localStorage.clear();
            window.location.href = "/";
        }
    }
}

// 알림 정보 로드
async function loadRecord() {
    try {
        const response = await fetch(`${backendUrl}/notifications/my`, {
            method: "GET",
            headers: { 'Authorization': `Bearer ${jwtToken}` }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch record data: ${response.text}`);
        }

        const record = await response.json();

        // record JSON 전체 데이터 출력
        console.log('record json 전체 데이터 출력');
        console.log(record);

        // 알림 내역 추가
        const tableBody = document.getElementById("recordTableBody");
        if (tableBody) {
            tableBody.innerHTML = ""; // 초기화
            // json을 배열로 변경
            const reports = Array.isArray(record) ? record : record.reports;
            console.log('record 배열 정보 출력');
            console.log(reports);

            if (reports?.length > 0) {
                // 배열을 역순으로 정렬
                const reversedReports = [...reports].reverse();

                reversedReports.forEach((report) => {
                    const formattedDate = formatDate(report.timestamp);
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td class="border px-4 py-2 text-center">${formattedDate || "날짜 없음"}</td>
                        <td class="border px-4 py-2 text-center">${report.message || "내용 없음"}</td>
                    `;
                    tableBody.appendChild(row);
                });
            } else {
                tableBody.innerHTML = `<tr><td colspan="2" class="text-center text-gray-500">알림 내역이 없습니다.</td></tr>`;
            }
        }
    } catch (error) {
        console.error("Error loading record:", error);

        const tableBody = document.getElementById("recordTableBody");
        if (tableBody) {
            tableBody.innerHTML = `<tr><td colspan="2" class="text-center text-red-500">record 데이터를 불러오는 중 오류가 발생했습니다.</td></tr>`;
        }

        if (error.message.includes("401") || error.message.includes("403")) {
            localStorage.clear();
            window.location.href = "/";
        }
    }
}

// 날짜 정보 정제
function formatDate(isoString) {
    const date = new Date(isoString);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
}