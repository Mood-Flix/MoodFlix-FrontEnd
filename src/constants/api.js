// 백엔드 API 설정 (단일 소스)
export const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  process.env.REACT_APP_API_URL ||
  'http://localhost:8080';

// API 엔드포인트
export const API_ENDPOINTS = {
  // 인증 관련
  KAKAO_LOGIN: '/api/auth/kakao',
  KAKAO_CALLBACK: '/api/auth/kakao/callback',
  REFRESH_TOKEN: '/api/auth/refresh',
  
  // 사용자 관련
  USER_PROFILE: '/api/user/profile',
  USER_PREFERENCES: '/api/user/preferences',
  
  // 영화 추천 관련
  MOVIE_RECOMMENDATIONS: '/api/movies/recommendations',
  MOVIE_SEARCH: '/api/movies/search',
  
  // 메인 페이지 영화 관련
  FEATURED_MOVIES: '/api/movies/featured',
  NEW_RELEASES: '/api/movies/new-releases',
  MOVIE_DETAILS: '/api/movies',
  MOVIE_TRAILER: '/api/movies/trailer',
};

// HTTP 헤더 설정
export const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// API 응답 처리
export const handleApiResponse = (response) => {
  if (response.status >= 200 && response.status < 300) {
    return response.data;
  }
  throw new Error(response.data?.message || 'API 요청 실패');
};

// API 에러 처리
export const handleApiError = (error) => {
  if (error.response?.status === 401) {
    // 토큰 만료 시 로그아웃 처리
    localStorage.removeItem('accessToken');
    // refreshToken은 즉시 삭제하지 않고 상위에서 갱신/로그아웃을 결정
    window.location.replace('/');
    return;
  }
  throw error;
};
