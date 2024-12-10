require('dotenv').config();
const express = require("express");  // Express 모듈 불러오기
const cors = require("cors");
const axios = require('axios');
const path = require("path");        // 경로 관련 유틸리티
const fs = require("fs");            // 파일 시스템 모듈
const https = require("https");      // https 모듈
const httpProxy = require('http-proxy-middleware');
const createProxyMiddleware = httpProxy.createProxyMiddleware;
const app = express();               // Express 앱 생성
const PORT = 3000;                   // 서버가 실행될 포트 번호

// 백엔드 API URL
const BACKEND_URL = 'http://3.39.57.93:8080';

// CORS 미들웨어 추가
app.use(cors({
    origin: ['https://localhost:3000', 'http://localhost:3000'], // 프론트엔드 도메인
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'] // 허용할 헤더 추가
}));

// 프록시 미들웨어 설정 1
app.use('/api', createProxyMiddleware({
    target: BACKEND_URL,
    changeOrigin: true,
    ws: true, // WebSocket 지원 추가
    pathRewrite: {
        '^/api': '', // '/api' 경로를 ''로 리작성
    },
    onProxyReq: (proxyReq, req, res) => {
        // 디버깅을 위한 로그 추가
        console.log('Proxy Request:', {
            path: proxyReq.path,
            method: proxyReq.method,
            headers: proxyReq.getHeaders()
        });
    },
    onError: (err, req, res) => {
        console.error('Proxy Error:', err);
        res.status(500).send('Proxy Error');
    }
}));



// 카카오 로그인 URL 요청
app.get('/api/kakao/login-url', async (req, res) => {
    try {
        console.log('Requesting login URL from:', `${BACKEND_URL}/member/login-url`);
        const response = await axios.get(`${BACKEND_URL}/member/login-url`);
        console.log('Login URL response:', response.data);
        res.status(200).send(response.data);
    } catch (error) {
        console.error('Error fetching login URL:', error);
        if (error.response) {
            console.error('Error response:', error.response.data);
            res.status(error.response.status).send(error.response.data);
        } else {
            res.status(500).send('Failed to fetch login URL');
        }
    }
});

// 카카오 콜백 처리
app.get('/api/kakao/callback', async (req, res) => {
    const { code } = req.query;

    if (!code) {
        return res.status(400).json({ error: 'Authorization code is missing' });
    }

    try {
        const response = await axios.get(`${BACKEND_URL}/member/callback`, {
            params: { code },
        });

        // 백엔드 응답 로깅
        console.log('Backend response:', response.data);

        // 응답 데이터 구조 확인 및 처리
        const userData = response.data;

        if (!userData || !userData.jwtToken) {
            throw new Error('Invalid response from backend');
        }

        // 클라이언트에 전달할 데이터 구조화
        const clientResponse = {
            jwtToken: userData.jwtToken,
            email: userData.email || '',
            nickname: userData.nickname || '',
            profileImage: userData.profileImage || '',
        };

        res.status(200).json(clientResponse);
    } catch (error) {
        console.error('Callback processing error:', error);
        console.error('Error details:', error.response?.data);
        res.status(500).json({
            error: 'Login process failed',
            details: error.message
        });
    }
});


// https 인증서 파일 경로 (자체 서명된 인증서>> 임시로 사용)
const privateKey = fs.readFileSync(path.join(__dirname, 'my-ssl', 'server.key'), 'utf8');
const certificate = fs.readFileSync(path.join(__dirname, 'my-ssl', 'server.crt'), 'utf8');
const credentials = { key: privateKey, cert: certificate };

// public 폴더를 정적 파일 경로로 설정
app.use(express.static(path.join(__dirname, "public")));

// 기본 라우트: mainpage.html 제공
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'login', 'login.html'));
});

app.get("/mainpage", (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'page', 'mainpage.html'));
});

app.get("/reward", (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'page', 'reward.html'));
});
app.get("/record", (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'page', 'record.html'));
});

// HTTPS 서버 실행
https.createServer(credentials, app).listen(PORT, () => {
    console.log(`서버가 실행 중입니다. https://localhost:${PORT} 에 접속하세요.`);
});