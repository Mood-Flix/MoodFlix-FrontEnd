import axios from 'axios';
import { jwtDecode } from "jwt-decode";

// .env 파일이나 다른 설정 파일에서 API 기본 URL을 관리합니다.
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  process.env.REACT_APP_API_URL ||
  'https://api.moodflix.store';

const authApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// 요청 인터셉터 - 모든 요청에 인증 헤더를 자동으로 추가합니다.
authApi.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * 카카오 로그인 서비스 로직
 * KakaoLogin.js에서 받은 카카오 액세스 토큰으로 백엔드에 로그인/회원가입을 요청합니다.
 * @param {string} kakaoAccessToken - 카카오 SDK로부터 받은 액세스 토큰
 * @returns {object} - 백엔드로부터 받은 { accessToken, userId, name } 데이터
 */
export const kakaoLogin = async (kakaoAccessToken) => {
  try {
    const response = await authApi.post('/api/auth/kakao', {
      accessToken: kakaoAccessToken,
    });
    
    const data = response.data;
    
    // 백엔드로부터 받은 JWT와 사용자 정보를 로컬 스토리지에 저장합니다.
    if (data && data.accessToken) {
      localStorage.setItem('accessToken', data.accessToken);
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      const user = data.user ?? { userId: data.userId, name: data.name, email: data.email, profileImage: data.profileImage };
      localStorage.setItem('userInfo', JSON.stringify(user));
    }
    
    return data;
  } catch (error) {
    console.error('카카오 로그인 API 호출 실패:', error.response?.status, error.message);
    throw error;
  }
};

// [참고] 토큰 갱신 로직 (백엔드에 /api/auth/refresh API 구현 후 사용 가능)
export const refreshToken = async () => {
  const stored = localStorage.getItem('refreshToken');
  if (!stored) {
    throw new Error('리프레시 토큰이 없습니다.');
  }
  try {
    const res = await authApi.post('/api/auth/refresh', { refreshToken: stored }, { withCredentials: true });
    const data = res.data;
    if (data?.accessToken) {
      localStorage.setItem('accessToken', data.accessToken);
    }
    if (data?.refreshToken) {
      localStorage.setItem('refreshToken', data.refreshToken);
    }
    if (data?.user) {
      localStorage.setItem('userInfo', JSON.stringify(data.user));
    }
    return data;
  } catch (error) {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    throw error;
  }
};

// 로그아웃
export const logout = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userInfo');
  
  if (window.Kakao && window.Kakao.Auth && window.Kakao.Auth.getAccessToken()) {
    window.Kakao.Auth.logout();
  }
};

// 토큰 유효성 검사
export const isTokenValid = () => {
  const token = localStorage.getItem('accessToken');
  if (!token) return false;
  
  try {
    const { exp } = jwtDecode(token);
    const currentTime = Math.floor(Date.now() / 1000);
    return typeof exp === 'number' && exp > currentTime;
  } catch (error) {
    return false;
  }
};

//  [수정] 저장된 사용자 정보 가져오기 (함수 이름을 원래대로 되돌림)
export const getUserProfile = () => {
    const userInfo = localStorage.getItem('userInfo');
    return userInfo ? JSON.parse(userInfo) : null;
};