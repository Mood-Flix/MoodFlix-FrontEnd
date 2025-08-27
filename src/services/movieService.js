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

// 피처드 영화 가져오기
export const getFeaturedMovies = async () => {
  try {
    const response = await movieApi.get(API_ENDPOINTS.FEATURED_MOVIES);
    return handleApiResponse(response);
  } catch (error) {
    console.error('피처드 영화 로딩 실패:', error);
    // 에러 시 기본 데이터 반환
    return {
      featured: {
        id: 1,
        title: "MONEY HEIST",
        subtitle: "PART 4",
        description: "스페인 최고의 도둑들이 은행을 터는 대담한 계획을 세운다",
        posterUrl: "/movie-posters/money-heist.jpg",
        trailerUrl: "https://www.youtube.com/watch?v=example",
        rating: 4.5,
        year: 2021,
        genre: "액션/범죄"
      }
    };
  }
};

// 신작 영화 가져오기
export const getNewReleases = async () => {
  try {
    const response = await movieApi.get(API_ENDPOINTS.NEW_RELEASES);
    return handleApiResponse(response);
  } catch (error) {
    console.error('신작 영화 로딩 실패:', error);
    // 에러 시 기본 데이터 반환
    return {
      movies: [
        { id: 1, title: "The Mother", posterUrl: "/movie-posters/the-mother.jpg", rating: 4.2, year: 2023 },
        { id: 2, title: "Blood & Gold", posterUrl: "/movie-posters/blood-gold.jpg", rating: 3.8, year: 2023 },
        { id: 3, title: "F9", posterUrl: "/movie-posters/f9.jpg", rating: 4.0, year: 2021 },
        { id: 4, title: "Perfection", posterUrl: "/movie-posters/perfection.jpg", rating: 3.5, year: 2023 },
        { id: 5, title: "Extraction", posterUrl: "/movie-posters/extraction.jpg", rating: 4.3, year: 2020 },
        { id: 6, title: "Jawan", posterUrl: "/movie-posters/jawan.jpg", rating: 4.1, year: 2023 },
        { id: 7, title: "Elemental", posterUrl: "/movie-posters/elemental.jpg", rating: 4.4, year: 2023 },
        { id: 8, title: "IO", posterUrl: "/movie-posters/io.jpg", rating: 3.7, year: 2023 }
      ]
    };
  }
};



// 영화 상세 정보 가져오기
export const getMovieDetails = async (movieId) => {
  try {
    const response = await movieApi.get(`${API_ENDPOINTS.MOVIE_DETAILS}/${movieId}`);
    return handleApiResponse(response);
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
