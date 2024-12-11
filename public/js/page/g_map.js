// 지도와 마커를 위한 변수 선언
let map, userMarker;
let isPingMode = false;
let pingMarker = null;
let locationUpdateInterval = null;
let isManualPingActive = false;
let reportMarkers = []; // 신고 마커들을 저장할 배열

// 구글 맵 API 로드
function loadGoogleMaps() {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDYWRi2dgvDWKVtCMEkorBl6vGbi5jVpac`;
    script.defer = true;
    script.async = true;
    script.onerror = () => alert('지도 로드에 실패했습니다.');
    script.onload = initMap;
    document.head.appendChild(script);
}


// 구글 지도 초기화 함수
function initMap() {
    const initialPosition = { lat: 37.5665, lng: 126.9780 };
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 12,
        center: initialPosition,
        gestureHandling: 'greedy'
    });

    userMarker = new google.maps.Marker({
        position: initialPosition,
        map: map,
        title: "현재 위치"
    });

    // 위치 정보 수신 설정 관련
    startLocationUpdates();

    map.addListener("click", (e) => {
        if (isPingMode) addPingMarker(e.latLng, true);
    });
}
// SVG 아이콘 생성 함수
function createCustomMarkerIcon(type) {
    let color, path;
    switch(type) {
        case 'truck':
            color = '#FF0000'; // 빨간색
            path = 'M-5,-8 L5,-8 L3,-3 L8,2 L0,10 L-8,2 L-3,-3 Z';
            break;
        case 'road':
            color = '#000000'; // 검은색
            path = 'M0,-10 L10,8 L-10,8 Z';
            break;
        case 'car':
            color = '#FFFF00'; // 노란색
            path = 'M-10,2 L-8,-2 L-3,-2 L-1,-6 L6,-6 L8,-2 L10,2 L8,6 L-8,6 Z M-6,6 L-4,9 L-1,9 L1,6 M4,6 L6,9 L9,9 L11,6';
            break;
        case 'alcohol':
            color = '#00FF00'; // 초록색
            path = 'M-8,-8 L8,-8 L-8,8 L8,8';
            break;
        case 'other':
            color = '#FFFFFF'; // 흰색
            path = 'M-4,-6 C-4,-10 4,-10 4,-6 C4,-2 0,-2 0,2 M-0.5,4 C-0.5,5.5 0.5,5.5 0.5,4 C0.5,2.5 -0.5,2.5 -0.5,4';
            break;
        default:
            color = '#808080'; // 기본 회색
            path = 'M-8,-8 L8,-8 L8,8 L-8,8 Z';
    }

    return {
        path: path,
        fillColor: color,
        fillOpacity: 1,
        strokeWeight: 1,
        strokeColor: '#000000',
        scale: 1,
        anchor: new google.maps.Point(0, 0)
    };
}
// 신고 데이터를 가져오는 함수
async function fetchReportData() {

    try {
        const response = await fetch('/api/report/all', {
            method: 'GET',
            credentials: 'include'  // 쿠키 포함
        });
        if (!response.ok) {
            throw new Error(`HTTPS error! status: ${response.status}`);
        }
        const reports = await response.json();
        return reports;
    } catch (error) {
        console.error('신고 데이터 가져오기 실패:', error);
        return [];
    }
}

// 신고 마커 업데이트 함수
async function updateReportMarkers() {
    // 기존 마커들 제거
    reportMarkers.forEach(marker => marker.setMap(null));
    reportMarkers = [];

    // 새로운 신고 데이터 가져오기
    const reports = await fetchReportData();

    // 현재 시간
    const now = new Date();

    // 신고 데이터 필터링 및 마커 생성
    reports.forEach(report => {
        const reportTime = new Date(report.timestamp);
        const timeDiff = (now - reportTime) / (1000 * 60 * 60 * 24); // 일 단위로 변환

        // 24시간 이내의 신뢰할 수 있는 신고만 표시
        if (timeDiff <= 1 && report.trust === true) {
            const marker = new google.maps.Marker({
                position: { lat: report.latitude, lng: report.longitude },
                map: map,
                icon: createCustomMarkerIcon(report.type),
                title: report.message || '신고 지점'
            });

            // 마커 클릭 이벤트 추가
            marker.addListener('click', () => {
                const infowindow = new google.maps.InfoWindow({
                    content: `
                        <div>
                            <h3>신고 정보</h3>
                            <p>유형: ${report.type}</p>
                            <p>시간: ${new Date(report.timestamp).toLocaleString()}</p>
                            <p>메시지: ${report.message || '없음'}</p>
                            ${report.text ? `<p>상세: ${report.text}</p>` : ''}
                        </div>
                    `
                });
                infowindow.open(map, marker);
            });

            reportMarkers.push(marker);
        }
    });
}

function startLocationUpdates() {
    const geolocationOptions = {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0
    };

    function getCurrentCoordinates() {
        return {
            latitude: parseFloat(localStorage.getItem("latitude")),
            longitude: parseFloat(localStorage.getItem("longitude"))
        };
    }

    // 초기 위치 가져오기
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                localStorage.setItem("latitude", position.coords.latitude);
                localStorage.setItem("longitude", position.coords.longitude);

                const coords = getCurrentCoordinates();
                const userLocation = new google.maps.LatLng(
                    coords.latitude,
                    coords.longitude
                );
                map.setCenter(userLocation);
                userMarker.setPosition(userLocation);
                updateLocationDisplay(userLocation);
                updateLocationToServer(coords.latitude, coords.longitude);

                // 초기 신고 마커 업데이트
                await updateReportMarkers();
            },
            handleGeolocationError,
            geolocationOptions
        );

        // 3초마다 위치 및 신고 마커 업데이트
        locationUpdateInterval = setInterval(async () => {
            if (!isManualPingActive) {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        localStorage.setItem("latitude", position.coords.latitude);
                        localStorage.setItem("longitude", position.coords.longitude);

                        const coords = getCurrentCoordinates();
                        const userLocation = new google.maps.LatLng(
                            coords.latitude,
                            coords.longitude
                        );
                        userMarker.setPosition(userLocation);
                        updateLocationDisplay(userLocation);
                        updateLocationToServer(coords.latitude, coords.longitude);

                        // 신고 마커 업데이트
                        await updateReportMarkers();
                    },
                    handleGeolocationError,
                    geolocationOptions
                );
            } else {
                const coords = getCurrentCoordinates();
                updateLocationToServer(coords.latitude, coords.longitude);
                // 수동 핑 모드에서도 신고 마커 업데이트
                await updateReportMarkers();
            }
        }, 3000);
    } else {
        alert("이 브라우저에서는 위치 서비스를 지원하지 않습니다.");
    }
}

// 서버에 위치 정보를 전송하는 함수
async function updateLocationToServer(latitude, longitude) {
    try {
        const jwtToken = localStorage.getItem('jwtToken');
        if (!jwtToken) {
            console.error('JWT 토큰이 없습니다.');
            return;
        }

        const url = `/api/location/update?latitude=${latitude}&longitude=${longitude}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${jwtToken}`
            },
            credentials: 'include'
        });

        if (!response.ok) {
            if (response.status === 403) {
                console.error('인증 오류: JWT 토큰이 유효하지 않거나 만료되었습니다.');
                return;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // 응답 텍스트로 받기
        const responseText = await response.text();
        console.log('위치 업데이트 성공:', responseText);
    } catch (error) {
        console.error('위치 업데이트 실패:', error);
        if (error.message) {
            console.error('에러 상세:', error.message);
        }
    }
}
// 위치 정보 오류 처리 함수
function handleGeolocationError(error) {
    let errorMessage = "";
    switch(error.code) {
        case error.PERMISSION_DENIED:
            errorMessage = "위치 정보 접근이 거부되었습니다. 설정에서 위치 정보 접근을 허용해주세요.";
            break;
        case error.POSITION_UNAVAILABLE:
            errorMessage = "위치 정보를 사용할 수 없습니다.";
            break;
        case error.TIMEOUT:
            errorMessage = "위치 정보 요청 시간이 초과되었습니다.";
            break;
        default:
            errorMessage = "알 수 없는 오류가 발생했습니다.";
            break;
    }
    alert(errorMessage);
    console.error('Geolocation error:', error);
}

// 위치 표시 업데이트 함수
function updateLocationDisplay(location) {
    const lat = location.lat().toFixed(4);
    const lng = location.lng().toFixed(4);

    localStorage.removeItem("latitude");
    localStorage.removeItem("longitude");
    localStorage.setItem("latitude", lat);
    localStorage.setItem("longitude", lng);

    const locationElement = document.getElementById('location');
    locationElement.innerHTML = `
        <div class="font-bold">[현재위치]</div>
        <div>위도: ${lat}</div>
        <div>경도: ${lng}</div>
    `;
}

// 신고 지점 핑 찍기
function addPingMarker(location, isPingModeAction = false, showAlert = true) {
    if (pingMarker) pingMarker.setMap(null);

    pingMarker = new google.maps.Marker({
        position: location,
        map: map,
        title: "Ping 위치",
        icon: createCustomMarkerIcon('other')  // 커스텀 아이콘을 사용
    });

    userMarker.setPosition(location);
    updateLocationDisplay(location);
    isManualPingActive = true;  // 수동 핑 활성화

    if (isPingModeAction) togglePingMode();
    if (showAlert) alert("위치변경이 완료되었습니다.");
}


// 핑 모드 토글 함수
function togglePingMode() {
    isPingMode = !isPingMode;
    const button = document.getElementById("pingButton");
    button.innerText = isPingMode ? "핑 찍기 중..." : "신고지점 핑 찍기";
    button.classList.toggle("bg-gray-500");
    button.classList.toggle("bg-red-800");
}

// 현재 위치로 핑잡기 함수
function moveToCurrentLocation() {
    if (navigator.geolocation) {
        const geolocationOptions = {
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 0
        };

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLocation = new google.maps.LatLng(
                    position.coords.latitude,
                    position.coords.longitude
                );

                addPingMarker(userLocation, false, false);
                map.setCenter(userLocation);
                updateLocationDisplay(userLocation);
                isManualPingActive = false;  // 현재 위치로 이동시 수동 핑 비활성화
            },
            handleGeolocationError,
            geolocationOptions
        );
    } else {
        alert("이 브라우저에서는 위치 서비스를 지원하지 않습니다.");
    }
}

document.addEventListener('DOMContentLoaded', loadGoogleMaps);