import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS, getAuthHeaders, handleApiResponse, handleApiError } from '../constants/api';

// axios 인스턴스 생성
const movieApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// 요청 인터셉터 - 인증 헤더 추가
movieApi.interceptors.request.use(
  (config) => {
    const authHeaders = getAuthHeaders();
    config.headers = { ...config.headers, ...authHeaders };
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터 - 에러 처리
movieApi.interceptors.response.use(
  (response) => response,
  (error) => {
    handleApiError(error);
    return Promise.reject(error);
  }
);

// TMDb 영화 동기화 (ADMIN 권한 필요)
export const syncMovies = async () => {
  try {
    const response = await movieApi.post(API_ENDPOINTS.MOVIE_SYNC);
    return handleApiResponse(response);
  } catch (error) {
    console.error('영화 동기화 실패:', error);
    throw error;
  }
};

// 영화 목록 가져오기 (단순 배열 형태)
export const getMovieList = async () => {
  try {
    const response = await movieApi.get(API_ENDPOINTS.MOVIE_LIST);
    const data = handleApiResponse(response);
    // 단순 배열 형태의 응답을 그대로 반환
    return data;
  } catch (error) {
    console.error('영화 목록 로딩 실패:', error);
    throw error;
  }
};

// 피처드 영화 가져오기 (영화 목록 중 첫 번째)
export const getFeaturedMovies = async () => {
  try {
    const response = await movieApi.get(API_ENDPOINTS.MOVIE_LIST);
    const data = handleApiResponse(response);
    // 배열 형태의 응답에서 첫 번째 영화를 피처드로 사용
    return {
      featured: Array.isArray(data) && data.length > 0 ? data[0] : null
    };
  } catch (error) {
    console.error('피처드 영화 로딩 실패:', error);
    return {
      featured: null
    };
  }
};

// 신작 영화 가져오기 (영화 목록 전체를 신작으로 사용)
export const getNewReleases = async () => {
  try {
    const response = await movieApi.get(API_ENDPOINTS.MOVIE_LIST);
    const data = handleApiResponse(response);
    // 배열 형태의 응답을 그대로 반환
    return {
      movies: Array.isArray(data) ? data : []
    };
  } catch (error) {
    console.error('신작 영화 로딩 실패:', error);
    return {
      movies: []
    };
  }
};

// 영화 상세 정보 가져오기
export const getMovieDetails = async (movieId) => {
  try {
    const response = await movieApi.get(`${API_ENDPOINTS.MOVIE_DETAILS}/${movieId}`);
    const data = handleApiResponse(response);
    return data;
  } catch (error) {
    console.error('영화 상세 정보 로딩 실패:', error);
    throw error;
  }
};

// 영화 예고편 URL 가져오기
export const getMovieTrailer = async (movieId) => {
  try {
    const response = await movieApi.get(`${API_ENDPOINTS.MOVIE_TRAILER}/${movieId}`);
    return handleApiResponse(response);
  } catch (error) {
    console.error('영화 예고편 로딩 실패:', error);
    return { trailerUrl: null };
  }
};

// 영화 검색
export const searchMovies = async (query, page = 1, limit = 20) => {
  try {
    const response = await movieApi.get(API_ENDPOINTS.MOVIE_SEARCH, {
      params: { q: query, page, limit }
    });
    return handleApiResponse(response);
  } catch (error) {
    console.error('영화 검색 실패:', error);
    return { movies: [], total: 0, page: 1 };
  }
};