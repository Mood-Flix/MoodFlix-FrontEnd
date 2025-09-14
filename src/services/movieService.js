import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS, getAuthHeaders, handleApiResponse, handleApiError } from '../constants/api';

// axios 인스턴스 생성 (성능 최적화)
const movieApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  // 압축 지원
  headers: {
    'Accept': 'application/json',
  },
  // 성능 최적화
  maxRedirects: 3,
  maxContentLength: 50 * 1024 * 1024, // 50MB
});

// 요청 인터셉터 - 인증 헤더 추가 및 성능 최적화
movieApi.interceptors.request.use(
  (config) => {
    const authHeaders = getAuthHeaders();
    config.headers = { ...config.headers, ...authHeaders };
    
    
    // 요청 시간 기록 (성능 측정용)
    config.metadata = { startTime: Date.now() };
    
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터 - 에러 처리 및 성능 측정
movieApi.interceptors.response.use(
  (response) => {
    // 응답 시간 측정
    if (response.config.metadata?.startTime) {
      const duration = Date.now() - response.config.metadata.startTime;
      console.log(`API 응답 시간: ${response.config.url} - ${duration}ms`);
    }
    return response;
  },
  (error) => {
    // 에러 응답 시간도 측정
    if (error.config?.metadata?.startTime) {
      const duration = Date.now() - error.config.metadata.startTime;
      console.log(`API 에러 응답 시간: ${error.config.url} - ${duration}ms`);
    }
    handleApiError(error);
    return Promise.reject(error);
  }
);

// TMDb 영화 동기화 (ADMIN 권한 필요)
export const syncMovies = async () => {
  try {
    const response = await movieApi.post(API_ENDPOINTS.MOVIE_SYNC);
    // 동기화 성공 시 캐시 무효화
    clearMovieCache();
    return handleApiResponse(response);
  } catch (error) {
    console.error('영화 동기화 실패:', error);
    throw error;
  }
};

// 영화 데이터 캐시 (더 공격적인 캐싱)
let movieDataCache = null;
const CACHE_DURATION = 30 * 60 * 1000; // 30분으로 연장
// in-flight 요청 디듀프
const inflightRequests = new Map();

// 영화 상세 정보 캐시 (개별 영화별)
const movieDetailsCache = new Map();
const MOVIE_CACHE_DURATION = 60 * 60 * 1000; // 1시간
const MAX_DETAIL_ENTRIES = 500;

// 프리로딩 큐
const preloadQueue = new Set();
const preloadInProgress = new Set();

// 캐시 관리 헬퍼 함수들
const evictOldestDetailIfNeeded = () => {
  if (movieDetailsCache.size <= MAX_DETAIL_ENTRIES) return;
  const oldestKey = movieDetailsCache.keys().next().value;
  movieDetailsCache.delete(oldestKey);
};

const sweepExpiredDetails = () => {
  const now = Date.now();
  for (const [k, v] of movieDetailsCache) {
    if (!v?.timestamp || now - v.timestamp >= MOVIE_CACHE_DURATION) {
      movieDetailsCache.delete(k);
    }
  }
};

// 통합된 영화 데이터 가져오기 (캐싱 포함) - 페이지네이션 지원
export const getMovieData = async (page = 0, size = 20, forceRefresh = false) => {
  try {
    // 캐시 키 생성 (페이지별)
    const cacheKey = `movies_page_${page}_size_${size}`;
    
    // 캐시가 유효하고 강제 새로고침이 아닌 경우 캐시된 데이터 반환
    if (!forceRefresh && movieDataCache?.[cacheKey] &&
        Date.now() - movieDataCache[cacheKey].timestamp < CACHE_DURATION) {
      return movieDataCache[cacheKey].data;
    }

    // 동시 요청 디듀프
    if (!forceRefresh && inflightRequests.has(cacheKey)) {
      return await inflightRequests.get(cacheKey);
    }

    // API 호출 (페이지네이션 파라미터 추가)
    const req = movieApi
      .get(API_ENDPOINTS.MOVIE_LIST, { params: { page, size } })
      .then((res) => handleApiResponse(res))
      .then((data) => {
        movieDataCache ||= {};
        movieDataCache[cacheKey] = { data, timestamp: Date.now() };
        return data;
      })
      .finally(() => inflightRequests.delete(cacheKey));
    inflightRequests.set(cacheKey, req);
    const data = await req;
    
    return data;
  } catch (error) {
    console.error('영화 데이터 로딩 실패:', error);
    throw error;
  }
};

// 영화 목록 가져오기 (단순 배열 형태) - 캐시된 데이터 사용
export const getMovieList = async () => {
  try {
    const page = await getMovieData();
    return Array.isArray(page) ? page : (page?.content || []);
  } catch (error) {
    console.error('영화 목록 로딩 실패:', error);
    throw error;
  }
};

// 피처드 영화 가져오기 (영화 목록 중 첫 번째) - 캐시된 데이터 사용
export const getFeaturedMovies = async () => {
  try {
    const data = await getMovieData();
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

// 신작 영화 가져오기 (영화 목록 전체를 신작으로 사용) - 캐시된 데이터 사용
export const getNewReleases = async () => {
  try {
    const data = await getMovieData();
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

// 캐시 무효화 함수
export const clearMovieCache = () => {
  movieDataCache = null;
};

// 영화 기본 정보만 가져오기 (개요 탭용 - 빠른 로딩)
export const getMovieBasicInfo = async (movieId) => {
  // 캐시 확인
  const cacheKey = `basic_${movieId}`;
  const cached = movieDetailsCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < MOVIE_CACHE_DURATION) {
    // 캐시된 데이터가 있으면 즉시 반환하고 백그라운드에서 프리로딩 시작
    preloadMovieData(movieId);
    return cached.data;
  }

  try {
    const response = await movieApi.get(`${API_ENDPOINTS.MOVIE_DETAILS}/${movieId}/basic`);
    const data = handleApiResponse(response);
    
    // 캐시에 저장
    movieDetailsCache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
    evictOldestDetailIfNeeded();
    
    // 백그라운드에서 추가 데이터 프리로딩
    preloadMovieData(movieId);
    
    return data;
  } catch (error) {
    console.error('영화 기본 정보 로딩 실패:', error);
    // 기본 정보 API가 없으면 전체 정보를 가져와서 필요한 부분만 반환
    const fullData = await getMovieDetails(movieId);
    const basicData = {
      id: fullData.id,
      title: fullData.title,
      originalTitle: fullData.originalTitle,
      posterUrl: fullData.posterUrl,
      releaseDate: fullData.releaseDate,
      runtime: fullData.runtime,
      countryName: fullData.countryName,
      certification: fullData.certification,
      genres: fullData.genres,
      voteAverage: fullData.voteAverage,
      voteCount: fullData.voteCount,
      popularity: fullData.popularity,
      overview: fullData.overview,
      keywords: fullData.keywords
    };
    
    // 캐시에 저장
    movieDetailsCache.set(cacheKey, {
      data: basicData,
      timestamp: Date.now()
    });
    
    return basicData;
  }
};

// 영화 상세 정보 가져오기 (전체 데이터)
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

// 영화 비디오 정보 가져오기
export const getMovieVideos = async (movieId) => {
  try {
    const response = await movieApi.get(`${API_ENDPOINTS.MOVIE_DETAILS}/${movieId}/videos`);
    const data = handleApiResponse(response);
    movieDetailsCache.set(`videos_${movieId}`, { data, timestamp: Date.now() });
    evictOldestDetailIfNeeded();
    return data;
  } catch (error) {
    console.error('영화 비디오 로딩 실패:', error);
    return { videos: [] };
  }
};

// 영화 포토 정보 가져오기
export const getMoviePhotos = async (movieId) => {
  try {
    const response = await movieApi.get(`${API_ENDPOINTS.MOVIE_DETAILS}/${movieId}/photos`);
    const data = handleApiResponse(response);
    movieDetailsCache.set(`photos_${movieId}`, { data, timestamp: Date.now() });
    evictOldestDetailIfNeeded();
    return data;
  } catch (error) {
    console.error('영화 포토 로딩 실패:', error);
    return { posters: [], backdrops: [] };
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

// 영화 추천 (감정 기반)
export const getMovieRecommendations = async (mood, customMood = '') => {
  try {
    const response = await movieApi.post(API_ENDPOINTS.MOVIE_RECOMMENDATIONS, {
      mood,
      customMood: customMood.trim()
    });
    return handleApiResponse(response);
  } catch (error) {
    console.error('영화 추천 실패:', error);
    throw error;
  }
};

// 프리로딩 함수들
export const preloadMovieData = async (movieId) => {
  if (preloadInProgress.has(movieId)) return;
  
  preloadInProgress.add(movieId);
  
  try {
    // 병렬로 비디오와 포토 데이터 프리로딩
    const promises = [
      preloadMovieVideos(movieId),
      preloadMoviePhotos(movieId)
    ];
    
    await Promise.allSettled(promises);
  } finally {
    preloadInProgress.delete(movieId);
  }
};

export const preloadMovieVideos = async (movieId) => {
  const cacheKey = `videos_${movieId}`;
  const cached = movieDetailsCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < MOVIE_CACHE_DURATION) {
    return cached.data;
  }
  
  try {
    const data = await getMovieVideos(movieId);
    movieDetailsCache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
    return data;
  } catch (error) {
    console.error('비디오 프리로딩 실패:', error);
    return { videos: [] };
  }
};

export const preloadMoviePhotos = async (movieId) => {
  const cacheKey = `photos_${movieId}`;
  const cached = movieDetailsCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < MOVIE_CACHE_DURATION) {
    return cached.data;
  }
  
  try {
    const data = await getMoviePhotos(movieId);
    movieDetailsCache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
    return data;
  } catch (error) {
    console.error('포토 프리로딩 실패:', error);
    return { posters: [], backdrops: [] };
  }
};

// 캐시된 데이터 가져오기 (즉시 반환)
export const getCachedMovieVideos = (movieId) => {
  const cacheKey = `videos_${movieId}`;
  const cached = movieDetailsCache.get(cacheKey);
  return cached && Date.now() - cached.timestamp < MOVIE_CACHE_DURATION ? cached.data : null;
};

export const getCachedMoviePhotos = (movieId) => {
  const cacheKey = `photos_${movieId}`;
  const cached = movieDetailsCache.get(cacheKey);
  return cached && Date.now() - cached.timestamp < MOVIE_CACHE_DURATION ? cached.data : null;
};

// 캐시 무효화 (개별 영화)
export const clearMovieDetailCache = (movieId) => {
  if (movieId) {
    movieDetailsCache.delete(`basic_${movieId}`);
    movieDetailsCache.delete(`videos_${movieId}`);
    movieDetailsCache.delete(`photos_${movieId}`);
  } else {
    movieDetailsCache.clear();
  }
  // 필요 시 만료 스윕
  sweepExpiredDetails();
};