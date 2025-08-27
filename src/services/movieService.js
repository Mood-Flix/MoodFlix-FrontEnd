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
        genre: "액션/범죄",
        status: "상영중",
        country: "스페인",
        duration: "120분",
        releaseDate: "2021.12.03.",
        originalWork: "오리지널",
        synopsis: "스페인 최고의 도둑들이 은행을 터는 대담한 계획을 세운다. 교수와 그의 팀은 스페인 조폐국을 터는 거대한 계획을 실행한다.",
        rank: "1위",
        audienceCount: "245만명",
        audienceRating: "9.25",
        netizenRating: "9.18"
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
        { 
          id: 1, 
          title: "The Mother", 
          posterUrl: "/movie-posters/the-mother.jpg", 
          rating: 4.2, 
          year: 2023,
          genre: "액션/스릴러",
          status: "상영종료",
          country: "미국",
          duration: "115분",
          releaseDate: "2023.05.12.",
          originalWork: "오리지널",
          synopsis: "자신의 과거를 숨기고 살아온 한 여성이 딸을 보호하기 위해 다시 싸우게 되는 액션 스릴러.",
          rank: "2위",
          audienceCount: "156만명",
          audienceRating: "8.45",
          netizenRating: "8.32"
        },
        { 
          id: 2, 
          title: "Blood & Gold", 
          posterUrl: "/movie-posters/blood-gold.jpg", 
          rating: 3.8, 
          year: 2023,
          genre: "액션/드라마",
          status: "상영종료",
          country: "독일",
          duration: "98분",
          releaseDate: "2023.05.26.",
          originalWork: "오리지널",
          synopsis: "제2차 세계대전 말기, 황금을 찾기 위해 경쟁하는 군인들의 이야기.",
          rank: "3위",
          audienceCount: "89만명",
          audienceRating: "7.89",
          netizenRating: "7.76"
        },
        { 
          id: 3, 
          title: "F9", 
          posterUrl: "/movie-posters/f9.jpg", 
          rating: 4.0, 
          year: 2021,
          genre: "액션/어드벤처",
          status: "상영종료",
          country: "미국",
          duration: "143분",
          releaseDate: "2021.06.25.",
          originalWork: "오리지널",
          synopsis: "패스트 & 퓨리어스 시리즈의 9번째 작품으로, 도미닉과 그의 팀의 새로운 모험.",
          rank: "4위",
          audienceCount: "234만명",
          audienceRating: "8.12",
          netizenRating: "8.05"
        },
        { 
          id: 4, 
          title: "Perfection", 
          posterUrl: "/movie-posters/perfection.jpg", 
          rating: 3.5, 
          year: 2023,
          genre: "스릴러/호러",
          status: "상영종료",
          country: "미국",
          duration: "90분",
          releaseDate: "2023.05.24.",
          originalWork: "오리지널",
          synopsis: "음악원에서 일어나는 충격적인 사건들을 다룬 스릴러.",
          rank: "5위",
          audienceCount: "67만명",
          audienceRating: "7.23",
          netizenRating: "7.15"
        },
        { 
          id: 5, 
          title: "Extraction", 
          posterUrl: "/movie-posters/extraction.jpg", 
          rating: 4.3, 
          year: 2020,
          genre: "액션/스릴러",
          status: "상영종료",
          country: "미국",
          duration: "116분",
          releaseDate: "2020.04.24.",
          originalWork: "만화",
          synopsis: "인도계 호주인 마약상의 아들을 구출하는 임무를 맡은 용병의 이야기.",
          rank: "6위",
          audienceCount: "189만명",
          audienceRating: "8.67",
          netizenRating: "8.54"
        },
        { 
          id: 6, 
          title: "Jawan", 
          posterUrl: "/movie-posters/jawan.jpg", 
          rating: 4.1, 
          year: 2023,
          genre: "액션/드라마",
          status: "상영종료",
          country: "인도",
          duration: "169분",
          releaseDate: "2023.09.07.",
          originalWork: "오리지널",
          synopsis: "인도 최고의 액션 스타 샤룩 칸이 출연하는 액션 드라마.",
          rank: "7위",
          audienceCount: "145만명",
          audienceRating: "8.34",
          netizenRating: "8.21"
        },
        { 
          id: 7, 
          title: "Elemental", 
          posterUrl: "/movie-posters/elemental.jpg", 
          rating: 4.4, 
          year: 2023,
          genre: "애니메이션/가족",
          status: "상영종료",
          country: "미국",
          duration: "101분",
          releaseDate: "2023.06.16.",
          originalWork: "오리지널",
          synopsis: "불, 물, 공기, 흙의 원소들이 살아가는 도시에서 펼쳐지는 로맨틱한 이야기.",
          rank: "8위",
          audienceCount: "178만명",
          audienceRating: "8.78",
          netizenRating: "8.65"
        },
        { 
          id: 8, 
          title: "IO", 
          posterUrl: "/movie-posters/io.jpg", 
          rating: 3.7, 
          year: 2023,
          genre: "SF/드라마",
          status: "상영종료",
          country: "미국",
          duration: "96분",
          releaseDate: "2023.01.18.",
          originalWork: "오리지널",
          synopsis: "지구가 위험에 처한 상황에서 생존을 위해 노력하는 사람들의 이야기.",
          rank: "9위",
          audienceCount: "92만명",
          audienceRating: "7.45",
          netizenRating: "7.32"
        }
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
