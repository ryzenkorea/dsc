// 지도와 마커를 위한 변수 선언
let map, userMarker;
let isPingMode = false;
let pingMarker = null;
let locationUpdateInterval = null;
let isManualPingActive = false;

// 사용자 정의 마커 데이터(테스트)
const markers = [
    { lat: 36.310, lng: 127.408, color: "red", shape: "falling" },
    { lat: 36.314, lng: 127.403, color: "blue", shape: "obstacle" },
    { lat: 36.311, lng: 127.393, color: "green", shape: "wrongway" },
    { lat: 36.313, lng: 127.400, color: "green", shape: "drowsy" },
    { lat: 36.312, lng: 127.399, color: "yellow", shape: "other" },
    { lat: 36.315, lng: 127.398, color: "yellow", shape: "other" },
];

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

// SVG 아이콘 생성 함수(커스텀 핑 테스트)
function createCustomMarkerIcon(color, shape) {
    let path;
    switch(shape) {
        case 'falling':
            path = 'M-5,-8 L5,-8 L3,-3 L8,2 L0,10 L-8,2 L-3,-3 Z';
            break;
        case 'obstacle':
            path = 'M0,-10 L10,8 L-10,8 Z';
            break;
        case 'wrongway':
            path = 'M-10,2 L-8,-2 L-3,-2 L-1,-6 L6,-6 L8,-2 L10,2 L8,6 L-8,6 Z M-6,6 L-4,9 L-1,9 L1,6 M4,6 L6,9 L9,9 L11,6';
            break;
        case 'drowsy':
            path = 'M-8,-8 L8,-8 L-8,8 L8,8';
            break;
        case 'other':
            path = 'M-4,-6 C-4,-10 4,-10 4,-6 C4,-2 0,-2 0,2 M-0.5,4 C-0.5,5.5 0.5,5.5 0.5,4 C0.5,2.5 -0.5,2.5 -0.5,4';
            break;
        default:
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

    // 사용자 정의 마커 추가
    markers.forEach(markerData => {
        new google.maps.Marker({
            position: { lat: markerData.lat, lng: markerData.lng },
            map: map,
            icon: createCustomMarkerIcon(markerData.color, markerData.shape),
            title: `${markerData.color} ${markerData.shape}`
        });
    });

    // 위치 정보 수신 설정 관련
    startLocationUpdates();

    map.addListener("click", (e) => {
        if (isPingMode) addPingMarker(e.latLng, true);
    });
}

// 위치 업데이트 시작 함수
function startLocationUpdates() {
    const geolocationOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
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
            (position) => {
                // localStorage에 위치 저장
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
                // 초기 위치도 서버에 전송
                updateLocationToServer(coords.latitude, coords.longitude);
            },
            handleGeolocationError,
            geolocationOptions
        );

        // 3초마다 위치 업데이트 설정
        locationUpdateInterval = setInterval(() => {
            if (!isManualPingActive) {  // 수동 핑이 활성화되지 않은 경우에만 업데이트
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        // localStorage에 위치 저장
                        localStorage.setItem("latitude", position.coords.latitude);
                        localStorage.setItem("longitude", position.coords.longitude);

                        const coords = getCurrentCoordinates();
                        const userLocation = new google.maps.LatLng(
                            coords.latitude,
                            coords.longitude
                        );
                        userMarker.setPosition(userLocation);
                        updateLocationDisplay(userLocation);
                        // 서버에 위치 정보 전송
                        updateLocationToServer(coords.latitude, coords.longitude);
                        console.log('위치 업데이트:', {
                            시간: new Date().toLocaleTimeString(),
                            위도: coords.latitude,
                            경도: coords.longitude
                        });
                    },
                    handleGeolocationError,
                    geolocationOptions
                );
            }else{
                const coords = getCurrentCoordinates();
                updateLocationToServer(coords.latitude, coords.longitude);
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
        title: "Ping 위치"
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
            timeout: 10000,
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